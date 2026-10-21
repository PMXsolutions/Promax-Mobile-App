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

export const DRAFT_PROTECT_PREFIX = "promaxcare.draft.v1.";

export function createDraftKey(): string {
  const bytes = new Uint8Array(32);
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function utf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array | null {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

function maskBytes(payload: Uint8Array, key: string): Uint8Array {
  const secret = utf8Bytes(key);
  if (secret.length === 0) return payload;
  const out = new Uint8Array(payload.length);
  for (let index = 0; index < payload.length; index += 1) {
    out[index] = payload[index] ^ secret[index % secret.length];
  }
  return out;
}

export function protectDraftPayload(plain: string, key: string): string {
  return `${DRAFT_PROTECT_PREFIX}${toBase64(maskBytes(utf8Bytes(plain), key))}`;
}

export function revealDraftPayload(stored: string, key: string): string | null {
  if (!stored.startsWith(DRAFT_PROTECT_PREFIX)) return stored;
  if (!key) return null;
  const masked = fromBase64(stored.slice(DRAFT_PROTECT_PREFIX.length));
  if (!masked) return null;
  return bytesToString(maskBytes(masked, key));
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
