export type DraftSubmitState = "editing" | "failed" | "in_flight";

export interface ReportDraft<T> {
  rosterId: string;
  form: T;
  updatedAt: string;
  submitState: DraftSubmitState;
  attemptId: string;
}

const SUBMIT_STATES = new Set<DraftSubmitState>([
  "editing",
  "failed",
  "in_flight",
]);

export function reportDraftStorageKey(
  kind: "create" | "edit",
  rosterId: string,
  owner: { staffId?: number | null; companyId?: number | null }
): string | null {
  const staffId = Number(owner.staffId);
  if (!Number.isFinite(staffId) || staffId <= 0) return null;

  const companyId = Number(owner.companyId);
  const companyPart =
    Number.isFinite(companyId) && companyId > 0
      ? String(Math.trunc(companyId))
      : "0";
  const safeRosterId = rosterId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `promaxcare.report-draft.c${companyPart}.s${Math.trunc(staffId)}.${kind}.${safeRosterId}`;
}

export function parseReportDraft<T>(raw: string | null): ReportDraft<T> | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ReportDraft<T>>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.rosterId !== "string" || !parsed.rosterId) return null;
    if (!parsed.form || typeof parsed.form !== "object") return null;
    if (
      typeof parsed.updatedAt !== "string" ||
      Number.isNaN(Date.parse(parsed.updatedAt))
    ) {
      return null;
    }
    if (
      typeof parsed.submitState !== "string" ||
      !SUBMIT_STATES.has(parsed.submitState as DraftSubmitState)
    ) {
      return null;
    }
    if (typeof parsed.attemptId !== "string" || !parsed.attemptId) return null;

    return parsed as ReportDraft<T>;
  } catch {
    return null;
  }
}

export function createDraft<T>(
  rosterId: string,
  form: T,
  now: Date,
  attemptId: string
): ReportDraft<T> {
  return {
    rosterId,
    form,
    updatedAt: now.toISOString(),
    submitState: "editing",
    attemptId,
  };
}

export function draftAfterEdit<T>(
  current: ReportDraft<T> | null,
  rosterId: string,
  form: T,
  now: Date,
  attemptId: string
): ReportDraft<T> {
  if (current?.submitState === "in_flight") {
    return {
      ...current,
      form,
      updatedAt: now.toISOString(),
    };
  }

  return {
    rosterId,
    form,
    updatedAt: now.toISOString(),
    submitState: current?.submitState === "failed" ? "failed" : "editing",
    attemptId: current?.attemptId || attemptId,
  };
}

export function beginDraftSubmit<T>(
  draft: ReportDraft<T>,
  now: Date,
  attemptId: string
):
  | { ok: true; draft: ReportDraft<T> }
  | { ok: false; reason: "in_flight" } {
  if (draft.submitState === "in_flight") {
    return { ok: false, reason: "in_flight" };
  }

  return {
    ok: true,
    draft: {
      ...draft,
      submitState: "in_flight",
      updatedAt: now.toISOString(),
      attemptId,
    },
  };
}

export function failDraftSubmit<T>(
  draft: ReportDraft<T>,
  now: Date
): ReportDraft<T> {
  return {
    ...draft,
    submitState: "failed",
    updatedAt: now.toISOString(),
  };
}

export function acknowledgeUncertainSubmit<T>(
  draft: ReportDraft<T>,
  now: Date
): ReportDraft<T> {
  if (draft.submitState !== "in_flight") return draft;
  return failDraftSubmit(draft, now);
}

export function restoredDraftNotice(
  draft: ReportDraft<unknown> | null
): string | null {
  if (!draft) return null;
  if (draft.submitState === "in_flight") {
    return "Unsent text was restored. A previous send may still be processing. Check your reports before sending again. This screen will not send until you confirm.";
  }
  return "Unsent report text was restored on this device.";
}
