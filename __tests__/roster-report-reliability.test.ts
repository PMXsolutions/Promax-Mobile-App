import { attendanceErrorMessage } from "@/libs/attendance-error";
import {
  CLOCK_IN_RADIUS_METERS,
  geofenceDecision,
  hasClientCoordinates,
} from "@/libs/geofence";
import {
  acknowledgeUncertainSubmit,
  beginDraftSubmit,
  createDraft,
  draftAfterEdit,
  parseReportDraft,
  reportDraftStorageKey,
  restoredDraftNotice,
} from "@/libs/report-draft";
import { validateReportForm } from "@/libs/report-validation";

const now = new Date("2026-10-21T08:00:00.000Z");

describe("report validation", () => {
  const base = {
    goal_Progress: "a".repeat(100),
    isIncident: false,
    details_IfIsIncipient: "",
  };

  it("keeps the 100 character progress rule, ignoring spaces", () => {
    expect(
      validateReportForm({ ...base, goal_Progress: `${"a".repeat(99)} ` })
    ).toEqual({
      ok: false,
      message:
        "Please provide at least 100 characters for 'Support plan progress and activities'.",
    });
    expect(validateReportForm(base)).toEqual({ ok: true });
  });

  it("still requires incident details when an incident is marked", () => {
    expect(
      validateReportForm({
        ...base,
        isIncident: true,
        details_IfIsIncipient: "   ",
      }).ok
    ).toBe(false);
  });
});

describe("report drafts", () => {
  it("restores text and blocks a second send while one may still be in flight", () => {
    const draft = createDraft("44", { goal_Progress: "kept text" }, now, "a1");
    const begun = beginDraftSubmit(draft, now, "a2");

    expect(begun.ok).toBe(true);
    if (!begun.ok) return;

    expect(beginDraftSubmit(begun.draft, now, "a3")).toEqual({
      ok: false,
      reason: "in_flight",
    });
    expect(restoredDraftNotice(begun.draft)).toContain("will not send");
    expect(begun.draft.form).toEqual({ goal_Progress: "kept text" });
  });

  it("allows another send only after the uncertain attempt is acknowledged", () => {
    const draft = {
      ...createDraft("44", { goal_Progress: "kept text" }, now, "a1"),
      submitState: "in_flight" as const,
    };
    const acknowledged = acknowledgeUncertainSubmit(draft, now);
    const begun = beginDraftSubmit(acknowledged, now, "a2");

    expect(acknowledged.submitState).toBe("failed");
    expect(begun.ok).toBe(true);
  });

  it("keeps an in-flight draft in flight while the text is edited", () => {
    const draft = {
      ...createDraft("44", { goal_Progress: "one" }, now, "a1"),
      submitState: "in_flight" as const,
    };
    const edited = draftAfterEdit(
      draft,
      "44",
      { goal_Progress: "two" },
      now,
      "a2"
    );

    expect(edited.submitState).toBe("in_flight");
    expect(edited.form).toEqual({ goal_Progress: "two" });
  });

  it("ignores a corrupt draft instead of crashing the form", () => {
    expect(parseReportDraft("{")).toBeNull();
    expect(parseReportDraft(JSON.stringify({ rosterId: "1" }))).toBeNull();
  });

  it("scopes create and edit drafts to the roster id", () => {
    expect(reportDraftStorageKey("create", "12")).not.toBe(
      reportDraftStorageKey("edit", "12")
    );
    expect(reportDraftStorageKey("create", "../12")).toBe(
      "promaxcare.report-draft.create.12"
    );
  });
});

describe("clock-in rules", () => {
  it("keeps the 1000 metre boundary inclusive and does not widen it", () => {
    expect(CLOCK_IN_RADIUS_METERS).toBe(1000);
    expect(geofenceDecision(1000)).toBe("inside");
    expect(geofenceDecision(1001)).toBe("outside");
  });

  it("treats a missing client coordinate as unavailable", () => {
    expect(hasClientCoordinates(0, 151)).toBe(false);
    expect(hasClientCoordinates(null, 151)).toBe(false);
    expect(hasClientCoordinates(-33.8, 151.2)).toBe(true);
  });

  it("tells staff to check the shift when clock-in has no server response", () => {
    expect(
      attendanceErrorMessage(
        { isAxiosError: true, message: "Network Error" },
        "clock in"
      )
    ).toContain("Check this shift");
  });
});
