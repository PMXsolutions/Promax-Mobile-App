import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDraft } from "@/libs/report-draft";
import {
  readDraftClaim,
  readReportDraft,
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
});
