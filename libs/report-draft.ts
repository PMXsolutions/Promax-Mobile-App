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

function positiveInteger(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

type DraftClaim = { orphaned: boolean };

const draftSends = new Map<string, DraftClaim>();

export function claimDraftSend(key: string): boolean {
  if (draftSends.has(key)) return false;
  draftSends.set(key, { orphaned: false });
  return true;
}

export function releaseDraftSend(key: string): void {
  draftSends.delete(key);
}

export function orphanDraftSend(key: string): void {
  const claim = draftSends.get(key);
  if (claim) claim.orphaned = true;
}

export function draftSendIsClaimed(key: string): boolean {
  return draftSends.has(key);
}

export function draftSendBlocksAcknowledge(
  key: string,
  ownsClaim: boolean
): boolean {
  const claim = draftSends.get(key);
  if (!claim || ownsClaim) return false;
  return !claim.orphaned;
}

export function reportSaveNeedsAcknowledge(error: unknown): boolean {
  if (!error || typeof error !== "object") return true;
  return (error as { response?: unknown }).response == null;
}

export function draftWriteAfterDelay<T>(
  current: ReportDraft<T> | null
): ReportDraft<T> | null {
  if (!current || current.submitState === "in_flight") return null;
  return current;
}

export function draftWriteMayReplace<T>(
  existing: ReportDraft<T> | null,
  incoming: ReportDraft<T>
): boolean {
  if (!existing) return true;
  return !(
    existing.submitState === "in_flight" && incoming.submitState === "editing"
  );
}

export function draftClaimStorageKey(draftKey: string): string {
  return `${draftKey}.claim`;
}

export function reportDraftStorageKey(
  kind: "create" | "edit",
  rosterId: string,
  owner: { staffId?: number | null; companyId?: number | null }
): string | null {
  const staffId = positiveInteger(owner.staffId);
  const companyId = positiveInteger(owner.companyId);
  if (staffId == null || companyId == null) return null;
  if (!rosterId || rosterId !== rosterId.replace(/[^a-zA-Z0-9_-]/g, "")) {
    return null;
  }

  return `promaxcare.report-draft.c${companyId}.s${staffId}.${kind}.${rosterId}`;
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
