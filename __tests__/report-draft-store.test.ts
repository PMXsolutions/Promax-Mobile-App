import { readFileSync } from "fs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createDraft } from "@/libs/report-draft";
import {
  readDraftClaim,
  readReportDraft,
  resetDraftKeyMemoryForTests,
  writeDraftClaim,
  writeReportDraft,
} from "@/libs/report-draft-store";

jest.mock("@react-native-async-storage/async-storage", () => {
  const memory = new Map<string, string>();
  let hold: Promise<void> | null = null;
  return {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      const pending = hold;
      hold = null;
      if (pending) await pending;
      memory.set(key, value);
    },
    removeItem: async (key: string) => {
      memory.delete(key);
    },
    __holdNext(pending: Promise<void>) {
      hold = pending;
    },
  };
});

jest.mock("expo-secure-store", () => {
  const memory = new Map<string, string>();
  const state = { getThrows: false, setThrows: false };
  return {
    getItemAsync: async (key: string) => {
      if (state.getThrows) throw new Error("secure get");
      return memory.get(key) ?? null;
    },
    setItemAsync: async (key: string, value: string) => {
      if (state.setThrows) throw new Error("secure set");
      memory.set(key, value);
    },
    __memory: memory,
    __state: state,
  };
});

const now = new Date("2026-10-21T08:00:00.000Z");

describe("report draft storage", () => {
  it("repairs a late editing write so the in-flight draft stays stored", async () => {
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    (
      AsyncStorage as unknown as { __holdNext(pending: Promise<void>): void }
    ).__holdNext(held);

    const editing = createDraft("12", { goal_Progress: "old" }, now, "a1");
    const inFlight = {
      ...editing,
      submitState: "in_flight" as const,
      form: { goal_Progress: "new" },
    };
    const key = "promaxcare.report-draft.c9.s4.create.race";
    const first = writeReportDraft(key, editing);
    await Promise.resolve();
    await writeReportDraft(key, inFlight);
    release();
    await first;

    const stored = await readReportDraft<typeof editing.form>(key);
    expect(stored?.submitState).toBe("in_flight");
    expect(stored?.form).toEqual({ goal_Progress: "new" });
  });

  it("keeps a persisted send claim after the draft body is still editing", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.claim-disk";
    expect(await writeDraftClaim(key)).toBe(true);
    expect(await readDraftClaim(key)).toBe(true);
    expect(await readDraftClaim(`${key}.missing`)).toBe(false);
  });

  it("stores the report text so a raw read does not show it, and keeps it when the key cannot be read", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.sealed";
    const draft = createDraft(key, { goal_Progress: "private progress" }, now, "a1");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const raw = await AsyncStorage.getItem(key);
    expect(raw).toBeTruthy();
    expect(raw).not.toContain("private progress");
    expect(raw).not.toContain("goal_Progress");
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "private progress",
    });

    resetDraftKeyMemoryForTests();
    (SecureStore as unknown as { __state: { getThrows: boolean } }).__state.getThrows =
      true;
    expect(await readReportDraft(key)).toBeNull();
    expect(await AsyncStorage.getItem(key)).toBe(raw);
    (SecureStore as unknown as { __state: { getThrows: boolean } }).__state.getThrows =
      false;
  });

  it("still reads a draft saved before protection, and logout does not delete drafts", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.legacy";
    const legacy = JSON.stringify(
      createDraft(key, { goal_Progress: "kept text" }, now, "a1")
    );
    await AsyncStorage.setItem(key, legacy);
    expect((await readReportDraft<{ goal_Progress: string }>(key))?.form).toEqual({
      goal_Progress: "kept text",
    });
    const logout = readFileSync("store/use-auth-store.ts", "utf8");
    expect(logout).not.toContain("removeReportDraft");
    expect(await AsyncStorage.getItem(key)).toBe(legacy);
  });

  it("keeps a long draft in secure storage under the 2048 byte item limit", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.long";
    const progress = "p".repeat(4000);
    const draft = createDraft(key, { goal_Progress: progress }, now, "a1");
    expect(await writeReportDraft(key, draft)).toBe(true);

    const raw = await AsyncStorage.getItem(key);
    expect(raw?.startsWith("promaxcare.draft.v1.")).toBe(true);
    expect(raw).not.toContain(progress);
    expect(raw).not.toContain("goal_Progress");

    const secure = (SecureStore as unknown as { __memory: Map<string, string> })
      .__memory;
    const chunks = [...secure.entries()].filter(([name]) => name.startsWith(`${key}.sec.`));
    expect(chunks.length).toBeGreaterThan(1);
    for (const [, value] of chunks) {
      expect(new TextEncoder().encode(value).length).toBeLessThanOrEqual(2048);
    }

    await AsyncStorage.removeItem(key);
    resetDraftKeyMemoryForTests();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: progress,
    });
  });

  it("keeps the saved draft when secure storage rejects the copy", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.secure-fail";
    const draft = createDraft(key, { goal_Progress: "kept after reject" }, now, "a1");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const before = await AsyncStorage.getItem(key);

    (SecureStore as unknown as { __state: { setThrows: boolean } }).__state.setThrows =
      true;
    const updated = {
      ...draft,
      updatedAt: "2026-10-21T09:00:00.000Z",
      form: { goal_Progress: "still kept" },
    };
    expect(await writeReportDraft(key, updated)).toBe(true);
    const raw = await AsyncStorage.getItem(key);
    expect(raw).not.toBe(before);
    expect(raw).not.toContain("still kept");
    expect(raw).not.toContain("goal_Progress");
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "still kept",
    });
    (SecureStore as unknown as { __state: { setThrows: boolean } }).__state.setThrows =
      false;
  });

  it("keeps a new draft when the secure key cannot be stored, and does not replace a protected one", async () => {
    const state = (
      SecureStore as unknown as {
        __state: { getThrows: boolean; setThrows: boolean };
      }
    ).__state;
    const protectedKey = "promaxcare.report-draft.c9.s4.create.keep-protected";
    resetDraftKeyMemoryForTests();
    state.getThrows = false;
    state.setThrows = false;
    const protectedDraft = createDraft(
      protectedKey,
      { goal_Progress: "sealed text" },
      now,
      "a1"
    );
    expect(await writeReportDraft(protectedKey, protectedDraft)).toBe(true);
    const protectedRaw = await AsyncStorage.getItem(protectedKey);
    expect(protectedRaw?.startsWith("promaxcare.draft.v1.")).toBe(true);
    expect(protectedRaw).not.toContain("sealed text");

    resetDraftKeyMemoryForTests();
    state.getThrows = true;
    state.setThrows = true;
    const fresh = "promaxcare.report-draft.c9.s4.create.no-key";
    const draft = createDraft(fresh, { goal_Progress: "kept plain" }, now, "a1");
    expect(await writeReportDraft(fresh, draft)).toBe(true);
    expect(await AsyncStorage.getItem(fresh)).toContain("kept plain");
    expect((await readReportDraft<typeof draft.form>(fresh))?.form).toEqual({
      goal_Progress: "kept plain",
    });
    expect(await writeReportDraft(protectedKey, draft)).toBe(false);
    expect(await AsyncStorage.getItem(protectedKey)).toBe(protectedRaw);
    state.getThrows = false;
    state.setThrows = false;
  });
});
