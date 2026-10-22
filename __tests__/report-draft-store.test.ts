import { readFileSync } from "fs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  createDraft,
  protectDraftPayload,
  SECURE_DRAFT_SAVE_FAILURE,
} from "@/libs/report-draft";
import {
  commitSubmittedDraft,
  readDraftClaim,
  readReportDraft,
  readSubmissionStatus,
  readSubmittedAttempt,
  resendDecision,
  resetDraftKeyMemoryForTests,
  writeDraftClaim,
  writeReportDraft,
} from "@/libs/report-draft-store";

jest.mock("@react-native-async-storage/async-storage", () => {
  const memory = new Map<string, string>();
  const removes: string[] = [];
  const state = {
    setThrows: false,
    removeThrows: false,
    submittedGetThrows: false,
    throwKeys: new Set<string>(),
  };
  let hold: Promise<void> | null = null;
  return {
    getItem: async (key: string) => {
      if (state.throwKeys.has(key)) throw new Error("async get");
      if (state.submittedGetThrows && key.endsWith(".submitted")) {
        throw new Error("async tombstone get");
      }
      return memory.get(key) ?? null;
    },
    setItem: async (key: string, value: string) => {
      const pending = hold;
      hold = null;
      if (pending) await pending;
      if (state.setThrows) throw new Error("async set");
      memory.set(key, value);
    },
    removeItem: async (key: string) => {
      removes.push(key);
      if (state.removeThrows) throw new Error("async remove");
      memory.delete(key);
    },
    __holdNext(pending: Promise<void>) {
      hold = pending;
    },
    __removes: removes,
    __state: state,
  };
});

jest.mock("expo-secure-store", () => {
  const memory = new Map<string, string>();
  const state = {
    getThrows: false,
    setThrows: false,
    deleteThrows: false,
    submittedGetThrows: false,
    throwKeys: new Set<string>(),
    setCount: 0,
    failAfterSets: null as number | null,
  };
  let hold: Promise<void> | null = null;
  let holdKey: ((key: string) => boolean) | null = null;
  let holding = false;
  return {
    getItemAsync: async (key: string) => {
      if (state.throwKeys.has(key)) throw new Error("secure get");
      if (state.submittedGetThrows && key.endsWith(".submitted")) {
        throw new Error("secure tombstone get");
      }
      if (state.getThrows) throw new Error("secure get");
      return memory.get(key) ?? null;
    },
    setItemAsync: async (key: string, value: string) => {
      if (hold && (holdKey == null || holdKey(key))) {
        const pending = hold;
        hold = null;
        holdKey = null;
        holding = true;
        await pending;
        holding = false;
      }
      if (state.failAfterSets != null) {
        state.setCount += 1;
        if (state.setCount > state.failAfterSets) {
          throw new Error("secure set interrupted");
        }
      }
      if (state.setThrows) throw new Error("secure set");
      memory.set(key, value);
    },
    deleteItemAsync: async (key: string) => {
      if (state.deleteThrows) throw new Error("secure delete");
      memory.delete(key);
    },
    __memory: memory,
    __state: state,
    __holdNext(pending: Promise<void>, match?: (key: string) => boolean) {
      hold = pending;
      holdKey = match ?? null;
    },
    __isHolding: () => holding,
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
      SecureStore as unknown as {
        __holdNext(pending: Promise<void>, match?: (key: string) => boolean): void;
      }
    ).__holdNext(held, (key) => key.includes(".sec.p.") && key.endsWith(".0"));

    const editing = createDraft("12", { goal_Progress: "old" }, now, "a1");
    const inFlight = {
      ...editing,
      submitState: "in_flight" as const,
      form: { goal_Progress: "new" },
    };
    const key = "promaxcare.report-draft.c9.s4.create.race";
    let firstDone = false;
    const first = writeReportDraft(key, editing).then((saved) => {
      firstDone = true;
      return saved;
    });
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (
        (
          SecureStore as unknown as { __isHolding(): boolean }
        ).__isHolding()
      ) {
        break;
      }
      await Promise.resolve();
    }
    expect(
      (SecureStore as unknown as { __isHolding(): boolean }).__isHolding()
    ).toBe(true);
    await writeReportDraft(key, inFlight);
    expect(firstDone).toBe(false);
    release();
    expect(await first).toBe(true);

    expect(await AsyncStorage.getItem(key)).toBeNull();
    const stored = await readReportDraft<typeof editing.form>(key);
    expect(stored?.submitState).toBe("in_flight");
    expect(stored?.form).toEqual({ goal_Progress: "new" });
    expect(JSON.stringify(stored)).not.toContain("\"old\"");
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
    expect(raw).toBeNull();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "private progress",
    });

    resetDraftKeyMemoryForTests();
    (SecureStore as unknown as { __state: { getThrows: boolean } }).__state.getThrows =
      true;
    expect(await readReportDraft(key)).toBeNull();
    expect(await AsyncStorage.getItem(key)).toBeNull();
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

    expect(await AsyncStorage.getItem(key)).toBeNull();

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
    expect(await writeReportDraft(key, updated)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(before);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "kept after reject",
    });
    expect(JSON.stringify(await readReportDraft(key))).not.toContain("still kept");
    (SecureStore as unknown as { __state: { setThrows: boolean } }).__state.setThrows =
      false;
  });

  it("does not store plaintext when the secure key cannot be stored, and does not replace a protected draft", async () => {
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
    expect(protectedRaw).toBeNull();
    const protectedChunks = secureChunks(protectedKey).map(
      (name) => [name, secureMemory().get(name)] as const
    );
    expect(protectedChunks.length).toBeGreaterThan(0);

    resetDraftKeyMemoryForTests();
    state.getThrows = true;
    state.setThrows = true;
    const fresh = "promaxcare.report-draft.c9.s4.create.no-key";
    const draft = createDraft(fresh, { goal_Progress: "kept plain" }, now, "a1");
    expect(await writeReportDraft(fresh, draft)).toBe(false);
    expect(await AsyncStorage.getItem(fresh)).toBeNull();
    expect(await readReportDraft(fresh)).toBeNull();
    expect(await writeReportDraft(protectedKey, draft)).toBe(false);
    expect(await AsyncStorage.getItem(protectedKey)).toBe(protectedRaw);
    state.getThrows = false;
    state.setThrows = false;
    resetDraftKeyMemoryForTests();
    for (const [name, value] of protectedChunks) {
      expect(secureMemory().get(name)).toBe(value);
    }
    expect((await readReportDraft<typeof protectedDraft.form>(protectedKey))?.form).toEqual({
      goal_Progress: "sealed text",
    });
    state.getThrows = false;
    state.setThrows = false;
  });
});

type StorageState = {
  setThrows: boolean;
  removeThrows: boolean;
  submittedGetThrows: boolean;
  throwKeys: Set<string>;
};

type SecureState = {
  getThrows: boolean;
  setThrows: boolean;
  deleteThrows: boolean;
  submittedGetThrows: boolean;
  throwKeys: Set<string>;
  setCount: number;
  failAfterSets: number | null;
};

function asyncState(): StorageState {
  return (AsyncStorage as unknown as { __state: StorageState }).__state;
}

function secureState(): SecureState {
  return (SecureStore as unknown as { __state: SecureState }).__state;
}

function secureMemory(): Map<string, string> {
  return (SecureStore as unknown as { __memory: Map<string, string> }).__memory;
}

function removedKeys(): string[] {
  return (AsyncStorage as unknown as { __removes: string[] }).__removes;
}

function inFlightDraft(attemptId: string, text: string) {
  return {
    ...createDraft("12", { goal_Progress: text }, now, attemptId),
    submitState: "in_flight" as const,
  };
}

function secureChunks(key: string): string[] {
  return [...secureMemory().keys()].filter((name) =>
    name.startsWith(`${key}.sec.`)
  );
}

describe("submitted draft tombstone", () => {
  afterEach(() => {
    const asyncFlags = asyncState();
    asyncFlags.setThrows = false;
    asyncFlags.removeThrows = false;
    asyncFlags.submittedGetThrows = false;
    asyncFlags.throwKeys.clear();
    const secureFlags = secureState();
    secureFlags.getThrows = false;
    secureFlags.setThrows = false;
    secureFlags.deleteThrows = false;
    secureFlags.submittedGetThrows = false;
    secureFlags.throwKeys.clear();
    secureFlags.failAfterSets = null;
    secureFlags.setCount = 0;
    removedKeys().length = 0;
  });

  it("restores a saved draft from secure storage until that attempt is tombstoned", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.resurrect";
    const draft = inFlightDraft("attempt-saved", "sent progress");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const raw = await AsyncStorage.getItem(key);
    const chunks = secureChunks(key).map(
      (name) => [name, secureMemory().get(name)] as const
    );
    expect(chunks.length).toBeGreaterThan(0);

    await AsyncStorage.removeItem(key);
    resetDraftKeyMemoryForTests();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "sent progress",
    });

    const saved = await commitSubmittedDraft(key, draft.attemptId);
    expect(saved).toEqual({ submitted: true, cleared: true });
    resetDraftKeyMemoryForTests();
    expect(await readReportDraft(key)).toBeNull();

    if (raw) await AsyncStorage.setItem(key, raw);
    for (const [name, value] of chunks) {
      if (value) secureMemory().set(name, value);
    }
    resetDraftKeyMemoryForTests();
    expect(await readReportDraft(key)).toBeNull();
    expect(await writeReportDraft(key, draft)).toBe(false);
    expect(await readReportDraft(key)).toBeNull();
    expect(await AsyncStorage.getItem(`${key}.submitted`)).not.toContain(
      "sent progress"
    );
    expect(await AsyncStorage.getItem(`${key}.submitted`)).not.toContain(
      "goal_Progress"
    );
  });

  it("records a successful acknowledgement before either body is removed", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.acked";
    const draft = inFlightDraft("attempt-acked", "acked progress");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const maskKey = secureMemory().get("promaxcare.report-draft.key");
    expect(maskKey).toBeTruthy();

    removedKeys().length = 0;
    const saved = await commitSubmittedDraft(key, draft.attemptId);
    expect(saved).toEqual({ submitted: true, cleared: true });
    expect(removedKeys()).not.toContain(`${key}.submitted`);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect(secureChunks(key)).toEqual([]);

    const tombstone = await AsyncStorage.getItem(`${key}.submitted`);
    expect(JSON.parse(tombstone ?? "")).toEqual({
      attemptId: "attempt-acked",
    });
    expect(tombstone).not.toContain("acked progress");
    expect(tombstone).not.toContain("goal_Progress");
    expect(secureMemory().get(`${key}.submitted`)).toBe(tombstone);
    expect(new TextEncoder().encode(tombstone ?? "").length).toBeLessThanOrEqual(
      2048
    );
    expect(secureMemory().get("promaxcare.report-draft.key")).toBe(maskKey);
    expect(await readSubmittedAttempt(key)).toBe("attempt-acked");
    resetDraftKeyMemoryForTests();
    expect(await readReportDraft(key)).toBeNull();
  });

  it("keeps an unsent draft when a different attempt is acknowledged", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.unsent";
    const unsent = createDraft(
      "12",
      { goal_Progress: "still typing" },
      now,
      "attempt-unsent"
    );
    expect(await writeReportDraft(key, unsent)).toBe(true);
    const raw = await AsyncStorage.getItem(key);

    const saved = await commitSubmittedDraft(key, "attempt-other");
    expect(saved).toEqual({ submitted: true, cleared: true });
    expect(await AsyncStorage.getItem(key)).toBe(raw);
    expect(secureChunks(key).length).toBeGreaterThan(0);
    expect((await readReportDraft<typeof unsent.form>(key))?.form).toEqual({
      goal_Progress: "still typing",
    });
    expect(await readSubmittedAttempt(key)).toBe("attempt-other");
  });

  it("does not tombstone or delete a draft when the response was lost", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.lost";
    const draft = inFlightDraft("attempt-lost", "maybe sent");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const raw = await AsyncStorage.getItem(key);

    expect(await readSubmittedAttempt(key)).toBeNull();
    expect(await AsyncStorage.getItem(`${key}.submitted`)).toBeNull();
    expect(secureMemory().get(`${key}.submitted`)).toBeUndefined();
    resetDraftKeyMemoryForTests();
    expect((await readReportDraft<typeof draft.form>(key))?.submitState).toBe(
      "in_flight"
    );
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "maybe sent",
    });
    expect(await AsyncStorage.getItem(key)).toBe(raw);

    const hook = readFileSync("hooks/use-report-draft.ts", "utf8");
    const markFailed = hook.slice(
      hook.indexOf("const markFailed"),
      hook.indexOf("return {")
    );
    expect(markFailed).not.toContain("commitSubmittedDraft");
    expect(markFailed).not.toContain("removeReportDraft");
    for (const form of [
      "modules/report/add-report-form.tsx",
      "modules/report/edit-report-form.tsx",
    ]) {
      const source = readFileSync(form, "utf8");
      expect(source).toContain(
        "await draft.markFailed(reportSaveNeedsAcknowledge(error))"
      );
      expect(source.indexOf("await draft.markSaved()")).toBeGreaterThan(
        source.indexOf("onSuccess:")
      );
      expect(source.indexOf("await draft.markSaved()")).toBeLessThan(
        source.indexOf("onError:")
      );
    }
  });

  it("keeps the bodies when cleanup fails and does not restore that attempt", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.cleanup";
    const draft = inFlightDraft("attempt-cleanup", "cleanup progress");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const raw = await AsyncStorage.getItem(key);
    const chunks = secureChunks(key).map(
      (name) => [name, secureMemory().get(name)] as const
    );

    asyncState().removeThrows = true;
    secureState().deleteThrows = true;
    const saved = await commitSubmittedDraft(key, draft.attemptId);
    expect(saved).toEqual({ submitted: true, cleared: false });
    expect(await AsyncStorage.getItem(key)).toBe(raw);
    for (const [name, value] of chunks) {
      expect(secureMemory().get(name)).toBe(value);
    }
    expect(await readSubmittedAttempt(key)).toBe("attempt-cleanup");
    resetDraftKeyMemoryForTests();
    expect(await readReportDraft(key)).toBeNull();
    expect(await writeReportDraft(key, draft)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(raw);
  });

  it("does not delete a draft when the tombstone cannot be stored", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.unstored";
    const draft = inFlightDraft("attempt-unstored", "keep this text");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const raw = await AsyncStorage.getItem(key);

    asyncState().setThrows = true;
    secureState().setThrows = true;
    removedKeys().length = 0;
    const saved = await commitSubmittedDraft(key, draft.attemptId);
    expect(saved).toEqual({ submitted: false, cleared: false });
    expect(removedKeys()).not.toContain(key);
    expect(await AsyncStorage.getItem(key)).toBe(raw);
    expect(await readSubmittedAttempt(key)).toBeNull();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "keep this text",
    });
  });

  it("keeps the draft and blocks resend when both tombstone reads throw", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.unreadable";
    const draft = inFlightDraft("attempt-unreadable", "visible again");
    expect(await writeReportDraft(key, draft)).toBe(true);
    asyncState().removeThrows = true;
    secureState().deleteThrows = true;
    expect(await commitSubmittedDraft(key, draft.attemptId)).toEqual({
      submitted: true,
      cleared: false,
    });
    const raw = await AsyncStorage.getItem(key);
    const beforeRemoves = removedKeys().length;

    asyncState().submittedGetThrows = true;
    expect(await readSubmissionStatus(key)).toEqual({
      state: "submitted",
      attemptId: "attempt-unreadable",
    });
    expect(resendDecision(await readSubmissionStatus(key), draft.attemptId)).toBe(
      "blocked_submitted"
    );

    secureState().submittedGetThrows = true;
    resetDraftKeyMemoryForTests();
    const status = await readSubmissionStatus(key);
    expect(status).toEqual({ state: "unreadable" });
    expect(resendDecision(status, draft.attemptId)).toBe("blocked_unreadable");
    expect(resendDecision(status, "attempt-other")).toBe("blocked_unreadable");
    expect(await readSubmittedAttempt(key)).toBeNull();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "visible again",
    });
    expect(await writeReportDraft(key, draft)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(raw);
    expect(removedKeys().length).toBe(beforeRemoves);

    asyncState().submittedGetThrows = false;
    secureState().submittedGetThrows = false;
    resetDraftKeyMemoryForTests();
    expect(await readSubmissionStatus(key)).toEqual({
      state: "submitted",
      attemptId: "attempt-unreadable",
    });
    expect(await readReportDraft(key)).toBeNull();
    expect(await writeReportDraft(key, draft)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(raw);
  });

  it("blocks resend while one tombstone read throws, then opens when both reads are absent", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.recover-none";
    const draft = inFlightDraft("attempt-recover", "still on device");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const raw = await AsyncStorage.getItem(key);
    const tombstone = `${key}.submitted`;

    asyncState().throwKeys.add(tombstone);
    let status = await readSubmissionStatus(key);
    expect(status.state).toBe("unreadable");
    expect(resendDecision(status, draft.attemptId)).toBe("blocked_unreadable");
    expect(await AsyncStorage.getItem(key)).toBe(raw);

    asyncState().throwKeys.clear();
    secureState().throwKeys.add(tombstone);
    status = await readSubmissionStatus(key);
    expect(status.state).toBe("unreadable");
    expect(await writeReportDraft(key, draft)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(raw);

    secureState().throwKeys.clear();
    resetDraftKeyMemoryForTests();
    status = await readSubmissionStatus(key);
    expect(status).toEqual({ state: "none" });
    expect(resendDecision(status, draft.attemptId)).toBe("open");
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "still on device",
    });
    expect(await AsyncStorage.getItem(key)).toBe(raw);
  });

  it("does not block another company or staff key when one tombstone cannot be read", async () => {
    const blockedKey = "promaxcare.report-draft.c9.s4.create.status";
    const otherCompany = "promaxcare.report-draft.c8.s4.create.status";
    const otherStaff = "promaxcare.report-draft.c9.s5.create.status";
    const blocked = inFlightDraft("attempt-blocked", "company nine");
    const companyDraft = createDraft(
      "12",
      { goal_Progress: "company eight" },
      now,
      "attempt-company"
    );
    const staffDraft = createDraft(
      "12",
      { goal_Progress: "staff five" },
      now,
      "attempt-staff"
    );
    expect(await writeReportDraft(blockedKey, blocked)).toBe(true);
    expect(await writeReportDraft(otherCompany, companyDraft)).toBe(true);
    expect(await writeReportDraft(otherStaff, staffDraft)).toBe(true);
    const blockedRaw = await AsyncStorage.getItem(blockedKey);
    const companyRaw = await AsyncStorage.getItem(otherCompany);
    const staffRaw = await AsyncStorage.getItem(otherStaff);
    asyncState().removeThrows = true;
    secureState().deleteThrows = true;
    expect(await commitSubmittedDraft(blockedKey, blocked.attemptId)).toEqual({
      submitted: true,
      cleared: false,
    });

    const tombstone = `${blockedKey}.submitted`;
    asyncState().throwKeys.add(tombstone);
    secureState().throwKeys.add(tombstone);
    resetDraftKeyMemoryForTests();
    const blockedStatus = await readSubmissionStatus(blockedKey);
    expect(blockedStatus).toEqual({ state: "unreadable" });
    expect(resendDecision(blockedStatus, blocked.attemptId)).toBe(
      "blocked_unreadable"
    );
    expect(await readSubmissionStatus(otherCompany)).toEqual({ state: "none" });
    expect(await readSubmissionStatus(otherStaff)).toEqual({ state: "none" });
    expect(resendDecision(await readSubmissionStatus(otherCompany), "attempt-company")).toBe(
      "open"
    );
    expect((await readReportDraft<typeof blocked.form>(blockedKey))?.form).toEqual({
      goal_Progress: "company nine",
    });
    expect(
      (await readReportDraft<typeof companyDraft.form>(otherCompany))?.form
    ).toEqual({ goal_Progress: "company eight" });
    expect(
      (await readReportDraft<typeof staffDraft.form>(otherStaff))?.form
    ).toEqual({ goal_Progress: "staff five" });
    expect(await AsyncStorage.getItem(blockedKey)).toBe(blockedRaw);
    expect(await AsyncStorage.getItem(otherCompany)).toBe(companyRaw);
    expect(await AsyncStorage.getItem(otherStaff)).toBe(staffRaw);
    expect(await writeReportDraft(otherCompany, companyDraft)).toBe(true);

    asyncState().throwKeys.clear();
    secureState().throwKeys.clear();
    expect(await readSubmissionStatus(blockedKey)).toEqual({
      state: "submitted",
      attemptId: "attempt-blocked",
    });
    expect(await readReportDraft(blockedKey)).toBeNull();
    expect(
      (await readReportDraft<typeof companyDraft.form>(otherCompany))?.form
    ).toEqual({ goal_Progress: "company eight" });

    const hook = readFileSync("hooks/use-report-draft.ts", "utf8");
    const acknowledge = hook.slice(
      hook.indexOf("const acknowledge"),
      hook.indexOf("const prepareSubmit")
    );
    const prepare = hook.slice(
      hook.indexOf("const prepareSubmit"),
      hook.indexOf("const markSaved")
    );
    expect(acknowledge.indexOf("blocked_unreadable")).toBeLessThan(
      acknowledge.indexOf("acknowledgeUncertainSubmit")
    );
    expect(acknowledge.indexOf("blocked_unreadable")).toBeLessThan(
      acknowledge.indexOf("removeDraftClaim")
    );
    expect(acknowledge).not.toContain("removeReportDraft");
    expect(prepare).toContain(
      "This report was not sent. This device could not check whether it was already sent."
    );
    expect(prepare).not.toContain("removeReportDraft");
    const store = readFileSync("libs/report-draft-store.ts", "utf8");
    expect(store).toContain(
      "plain` is the report JSON. Device encryption is expo-secure-store, not this function."
    );
    expect(readFileSync("libs/report-draft.ts", "utf8")).toContain(
      "This is not encryption."
    );
  });

  it("blocks the same attempt after restart and still accepts a new one", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.restart";
    const draft = inFlightDraft("attempt-restart", "restart progress");
    expect(await writeReportDraft(key, draft)).toBe(true);
    expect(await commitSubmittedDraft(key, draft.attemptId)).toEqual({
      submitted: true,
      cleared: true,
    });

    resetDraftKeyMemoryForTests();
    expect(await readReportDraft(key)).toBeNull();
    expect(await readSubmittedAttempt(key)).toBe("attempt-restart");
    expect(await writeReportDraft(key, draft)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBeNull();

    const next = createDraft(
      "12",
      { goal_Progress: "new unsent" },
      new Date("2026-10-21T09:00:00.000Z"),
      "attempt-next"
    );
    expect(await writeReportDraft(key, next)).toBe(true);
    expect((await readReportDraft<typeof next.form>(key))?.form).toEqual({
      goal_Progress: "new unsent",
    });
    expect(await readSubmittedAttempt(key)).toBe("attempt-restart");

    const hook = readFileSync("hooks/use-report-draft.ts", "utf8");
    const prepare = hook.slice(
      hook.indexOf("const prepareSubmit"),
      hook.indexOf("const markSaved")
    );
    const markSaved = hook.slice(
      hook.indexOf("const markSaved"),
      hook.indexOf("const markFailed")
    );
    expect(prepare.indexOf("readSubmissionStatus")).toBeLessThan(
      prepare.indexOf("claimDraftSend")
    );
    expect(prepare.indexOf("blocked_unreadable")).toBeLessThan(
      prepare.indexOf("claimDraftSend")
    );
    expect(prepare).toContain(
      "This report was already sent from this device. It was not sent again."
    );
    expect(markSaved).toContain("commitSubmittedDraft");
    expect(markSaved).not.toContain("removeReportDraft");
    expect(markSaved.indexOf("commitSubmittedDraft")).toBeLessThan(
      markSaved.indexOf("removeDraftClaim")
    );
    expect(hook).not.toContain("removeReportDraft");
    const logout = readFileSync("store/use-auth-store.ts", "utf8");
    expect(logout).not.toContain("removeReportDraft");
    expect(logout).not.toContain("commitSubmittedDraft");
    expect(readFileSync("libs/report-draft.ts", "utf8")).toContain(
      "This is not encryption."
    );
  });

  it("keeps another company and another staff draft when one attempt is submitted", async () => {
    const submittedKey = "promaxcare.report-draft.c9.s4.create.tenant";
    const otherCompany = "promaxcare.report-draft.c8.s4.create.tenant";
    const otherStaff = "promaxcare.report-draft.c9.s5.create.tenant";
    const sent = inFlightDraft("attempt-tenant", "company nine");
    const companyDraft = createDraft(
      "12",
      { goal_Progress: "company eight" },
      now,
      "attempt-tenant"
    );
    const staffDraft = createDraft(
      "12",
      { goal_Progress: "staff five" },
      now,
      "attempt-other-staff"
    );
    expect(await writeReportDraft(submittedKey, sent)).toBe(true);
    expect(await writeReportDraft(otherCompany, companyDraft)).toBe(true);
    expect(await writeReportDraft(otherStaff, staffDraft)).toBe(true);
    const companyRaw = await AsyncStorage.getItem(otherCompany);
    const staffRaw = await AsyncStorage.getItem(otherStaff);

    expect(await commitSubmittedDraft(submittedKey, sent.attemptId)).toEqual({
      submitted: true,
      cleared: true,
    });
    resetDraftKeyMemoryForTests();
    expect(await readReportDraft(submittedKey)).toBeNull();
    expect(await writeReportDraft(otherCompany, companyDraft)).toBe(true);
    expect(
      (await readReportDraft<typeof companyDraft.form>(otherCompany))?.form
    ).toEqual({ goal_Progress: "company eight" });
    expect(
      (await readReportDraft<typeof staffDraft.form>(otherStaff))?.form
    ).toEqual({ goal_Progress: "staff five" });
    expect(await AsyncStorage.getItem(otherCompany)).toBe(companyRaw);
    expect(await AsyncStorage.getItem(otherStaff)).toBe(staffRaw);
    expect(await readSubmittedAttempt(otherCompany)).toBeNull();
    expect(await readSubmittedAttempt(otherStaff)).toBeNull();
    expect(await AsyncStorage.getItem(`${submittedKey}.submitted`)).not.toContain(
      "company eight"
    );
    expect(await AsyncStorage.getItem(`${submittedKey}.submitted`)).not.toContain(
      "staff five"
    );
  });
});

describe("protected draft persistence", () => {
  afterEach(() => {
    const asyncFlags = asyncState();
    asyncFlags.setThrows = false;
    asyncFlags.removeThrows = false;
    asyncFlags.submittedGetThrows = false;
    asyncFlags.throwKeys.clear();
    const secureFlags = secureState();
    secureFlags.getThrows = false;
    secureFlags.setThrows = false;
    secureFlags.deleteThrows = false;
    secureFlags.submittedGetThrows = false;
    secureFlags.throwKeys.clear();
    secureFlags.failAfterSets = null;
    secureFlags.setCount = 0;
  });

  it("reads the same protected draft after restart and logout does not delete it", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.restart-memory";
    const draft = createDraft(key, { goal_Progress: "still here" }, now, "a1");
    expect(await writeReportDraft(key, draft)).toBe(true);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    resetDraftKeyMemoryForTests();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "still here",
    });
    const logout = readFileSync("store/use-auth-store.ts", "utf8");
    expect(logout).not.toContain("removeReportDraft");
    expect(logout).not.toContain("commitSubmittedDraft");
    expect(await AsyncStorage.getItem(key)).toBeNull();
  });

  it("keeps the previous draft when a secure write stops before the new copy is committed", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.interrupt";
    const original = createDraft(key, { goal_Progress: "original text" }, now, "a1");
    expect(await writeReportDraft(key, original)).toBe(true);
    const flags = secureState();
    flags.setCount = 0;
    flags.failAfterSets = 1;
    const updated = {
      ...original,
      updatedAt: "2026-10-21T09:30:00.000Z",
      form: { goal_Progress: "partial text" },
    };
    expect(await writeReportDraft(key, updated)).toBe(false);
    expect(secureMemory().get(`${key}.sec.pending`)).toBeUndefined();
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect((await readReportDraft<typeof original.form>(key))?.form).toEqual({
      goal_Progress: "original text",
    });
    expect(JSON.stringify(await readReportDraft(key))).not.toContain("partial text");
  });

  it("retries a secure save after storage starts working and still stores no plaintext", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.retry";
    const draft = createDraft(key, { goal_Progress: "first copy" }, now, "a1");
    expect(await writeReportDraft(key, draft)).toBe(true);
    const flags = secureState();
    flags.setThrows = true;
    const updated = {
      ...draft,
      updatedAt: "2026-10-21T09:40:00.000Z",
      form: { goal_Progress: "retried copy" },
    };
    expect(await writeReportDraft(key, updated)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "first copy",
    });
    flags.setThrows = false;
    flags.setCount = 0;
    flags.failAfterSets = null;
    expect(await writeReportDraft(key, updated)).toBe(true);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "retried copy",
    });
  });

  it("does not let an older editing copy replace an in-flight draft", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.concurrent";
    const inFlight = {
      ...createDraft(key, { goal_Progress: "sending" }, now, "a1"),
      submitState: "in_flight" as const,
    };
    expect(await writeReportDraft(key, inFlight)).toBe(true);
    const stale = {
      ...inFlight,
      submitState: "editing" as const,
      updatedAt: "2026-10-21T10:00:00.000Z",
      form: { goal_Progress: "stale edit" },
    };
    expect(await writeReportDraft(key, stale)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect((await readReportDraft<typeof inFlight.form>(key))?.form).toEqual({
      goal_Progress: "sending",
    });
    expect((await readReportDraft<typeof inFlight.form>(key))?.submitState).toBe(
      "in_flight"
    );
  });

  it("keeps another company draft when this company's secure save fails", async () => {
    const mine = "promaxcare.report-draft.c9.s4.create.outage";
    const other = "promaxcare.report-draft.c8.s4.create.outage";
    const mineDraft = createDraft(mine, { goal_Progress: "company nine" }, now, "a1");
    const otherDraft = createDraft(other, { goal_Progress: "company eight" }, now, "a1");
    expect(await writeReportDraft(mine, mineDraft)).toBe(true);
    expect(await writeReportDraft(other, otherDraft)).toBe(true);
    const otherChunks = secureChunks(other).map(
      (name) => [name, secureMemory().get(name)] as const
    );
    secureState().setThrows = true;
    const updated = {
      ...mineDraft,
      updatedAt: "2026-10-21T11:00:00.000Z",
      form: { goal_Progress: "company nine failed" },
    };
    expect(await writeReportDraft(mine, updated)).toBe(false);
    secureState().setThrows = false;
    for (const [name, value] of otherChunks) {
      expect(secureMemory().get(name)).toBe(value);
    }
    expect((await readReportDraft<typeof mineDraft.form>(mine))?.form).toEqual({
      goal_Progress: "company nine",
    });
    expect((await readReportDraft<typeof otherDraft.form>(other))?.form).toEqual({
      goal_Progress: "company eight",
    });
    expect(await AsyncStorage.getItem(mine)).toBeNull();
    expect(await AsyncStorage.getItem(other)).toBeNull();
    expect(JSON.stringify(await readReportDraft(mine))).not.toContain(
      "company nine failed"
    );
  });

  it("recovers a plaintext draft and drops that copy only after the secure copy reads back", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.migrate";
    const legacy = JSON.stringify(
      createDraft(key, { goal_Progress: "legacy text" }, now, "a1")
    );
    await AsyncStorage.setItem(key, legacy);
    expect((await readReportDraft<{ goal_Progress: string }>(key))?.form).toEqual({
      goal_Progress: "legacy text",
    });
    secureState().setThrows = true;
    const updated = createDraft(
      key,
      { goal_Progress: "moved text" },
      new Date("2026-10-21T12:00:00.000Z"),
      "a1"
    );
    expect(await writeReportDraft(key, updated)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(legacy);
    expect((await readReportDraft<{ goal_Progress: string }>(key))?.form).toEqual({
      goal_Progress: "legacy text",
    });
    secureState().setThrows = false;
    expect(await writeReportDraft(key, updated)).toBe(true);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect((await readReportDraft<{ goal_Progress: string }>(key))?.form).toEqual({
      goal_Progress: "moved text",
    });
  });

  it("keeps a masked draft when it cannot be revealed, and does not replace it with plaintext", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.masked";
    const material = "cd".repeat(32);
    secureMemory().set("promaxcare.report-draft.key", material);
    resetDraftKeyMemoryForTests();
    const draft = createDraft(key, { goal_Progress: "masked text" }, now, "a1");
    const masked = protectDraftPayload(JSON.stringify(draft), material);
    await AsyncStorage.setItem(key, masked);
    expect(masked.startsWith("promaxcare.draft.v1.")).toBe(true);
    expect(masked).not.toContain("masked text");
    expect((await readReportDraft<typeof draft.form>(key))?.form).toEqual({
      goal_Progress: "masked text",
    });
    resetDraftKeyMemoryForTests();
    secureState().getThrows = true;
    expect(await readReportDraft(key)).toBeNull();
    expect(await AsyncStorage.getItem(key)).toBe(masked);
    secureState().getThrows = false;
    secureState().setThrows = true;
    resetDraftKeyMemoryForTests();
    const replacement = createDraft(
      key,
      { goal_Progress: "not stored" },
      new Date("2026-10-21T13:00:00.000Z"),
      "a2"
    );
    expect(await writeReportDraft(key, replacement)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(masked);
    expect(await AsyncStorage.getItem(key)).not.toContain("not stored");
  });

  it("does not report success while a plaintext copy is still in app storage", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.leftover";
    const legacy = JSON.stringify(
      createDraft(key, { goal_Progress: "old plain" }, now, "a1")
    );
    await AsyncStorage.setItem(key, legacy);
    asyncState().removeThrows = true;
    const updated = createDraft(
      key,
      { goal_Progress: "secured text" },
      new Date("2026-10-21T14:00:00.000Z"),
      "a1"
    );
    expect(await writeReportDraft(key, updated)).toBe(false);
    expect(await AsyncStorage.getItem(key)).toBe(legacy);
    expect((await readReportDraft<typeof updated.form>(key))?.form).toEqual({
      goal_Progress: "secured text",
    });
  });

  it("removes a legacy plaintext body only after that attempt is acknowledged", async () => {
    const key = "promaxcare.report-draft.c9.s4.create.legacy-ack";
    const sent = inFlightDraft("attempt-legacy", "legacy sent");
    await AsyncStorage.setItem(key, JSON.stringify(sent));
    removedKeys().length = 0;
    expect(await commitSubmittedDraft(key, sent.attemptId)).toEqual({
      submitted: true,
      cleared: true,
    });
    expect(removedKeys()).toContain(key);
    expect(await AsyncStorage.getItem(key)).toBeNull();
    expect(await AsyncStorage.getItem(`${key}.submitted`)).not.toContain("legacy sent");
    expect(await AsyncStorage.getItem(`${key}.submitted`)).not.toContain("goal_Progress");

    const otherKey = "promaxcare.report-draft.c9.s4.create.legacy-other";
    const other = JSON.stringify(
      createDraft(otherKey, { goal_Progress: "other attempt" }, now, "attempt-other")
    );
    await AsyncStorage.setItem(otherKey, other);
    removedKeys().length = 0;
    expect(await commitSubmittedDraft(otherKey, "attempt-legacy")).toEqual({
      submitted: true,
      cleared: true,
    });
    expect(removedKeys()).not.toContain(otherKey);
    expect(await AsyncStorage.getItem(otherKey)).toBe(other);
  });

  it("shows the secure-storage failure from save, send, and retry paths", () => {
    const hook = readFileSync("hooks/use-report-draft.ts", "utf8");
    const store = readFileSync("libs/report-draft-store.ts", "utf8");
    expect(readFileSync("libs/report-draft.ts", "utf8")).toContain(
      SECURE_DRAFT_SAVE_FAILURE
    );
    const autosave = hook.slice(
      hook.indexOf("draftWriteAfterDelay"),
      hook.indexOf("const acknowledge")
    );
    expect(autosave).toContain("setNotice(SECURE_DRAFT_SAVE_FAILURE)");
    const prepare = hook.slice(
      hook.indexOf("const prepareSubmit"),
      hook.indexOf("const markSaved")
    );
    expect(prepare).toContain("setNotice(SECURE_DRAFT_SAVE_FAILURE)");
    const markFailed = hook.slice(
      hook.indexOf("const markFailed"),
      hook.indexOf("return {")
    );
    expect(markFailed).toContain("setNotice(SECURE_DRAFT_SAVE_FAILURE)");
    expect(markFailed).not.toContain("removeReportDraft");
    const writeFn = store.slice(
      store.indexOf("export async function writeReportDraft"),
      store.indexOf("export async function writeDraftClaim")
    );
    expect(writeFn).not.toContain("AsyncStorage.setItem");
    expect(writeFn).not.toContain("protectDraftPayload");
    expect(writeFn).toContain("if (!keyMaterial) return false");
    expect(store).toContain(
      "plain` is the report JSON. Device encryption is expo-secure-store, not this function."
    );
    expect(readFileSync("libs/report-draft.ts", "utf8")).toContain(
      "This is not encryption."
    );
  });
});
