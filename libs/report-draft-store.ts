import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  DRAFT_PROTECT_PREFIX,
  ReportDraft,
  createDraftKey,
  draftClaimStorageKey,
  draftWriteMayReplace,
  parseReportDraft,
  revealDraftPayload,
} from "@/libs/report-draft";

const DRAFT_KEY_NAME = "promaxcare.report-draft.key";
const SECURE_CHUNK_BYTES = 1800;
const SECURE_VALUE_LIMIT = 2048;

const writeEpoch = new Map<string, number>();
let memoryDraftKey: string | null = null;

export function resetDraftKeyMemoryForTests(): void {
  memoryDraftKey = null;
}

async function draftKey(): Promise<string | null> {
  if (memoryDraftKey) return memoryDraftKey;
  try {
    const existing = await SecureStore.getItemAsync(DRAFT_KEY_NAME);
    if (existing) {
      memoryDraftKey = existing;
      return existing;
    }
    const created = createDraftKey();
    await SecureStore.setItemAsync(DRAFT_KEY_NAME, created);
    memoryDraftKey = created;
    return created;
  } catch {
    return memoryDraftKey;
  }
}

async function readStoredRaw(
  key: string
): Promise<"missing" | "unreadable" | string> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? "missing" : raw;
  } catch {
    return "unreadable";
  }
}

function plainDraft(raw: string, key: string | null): string | null {
  if (!raw.startsWith(DRAFT_PROTECT_PREFIX)) return raw;
  if (!key) return null;
  return revealDraftPayload(raw, key);
}

function utf8Size(value: string): number {
  return new TextEncoder().encode(value).length;
}

function splitForSecureStore(value: string): string[] | null {
  const chunks: string[] = [];
  let current = "";
  for (const char of value) {
    const next = current + char;
    if (utf8Size(next) > SECURE_CHUNK_BYTES) {
      if (!current || utf8Size(char) > SECURE_CHUNK_BYTES) return null;
      chunks.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function readSecureSlot(
  draftKey: string,
  slot: string
): Promise<string | null> {
  try {
    const header = await SecureStore.getItemAsync(`${draftKey}.${slot}.n`);
    if (!header) return null;
    const [countRaw, bytesRaw] = header.split(":");
    const count = Number(countRaw);
    const bytes = Number(bytesRaw);
    if (!Number.isInteger(count) || count <= 0 || count >= 1000 || !Number.isInteger(bytes)) {
      return null;
    }
    const parts: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const part = await SecureStore.getItemAsync(`${draftKey}.${slot}.${index}`);
      if (part == null || utf8Size(part) > SECURE_VALUE_LIMIT) return null;
      parts.push(part);
    }
    const joined = parts.join("");
    if (utf8Size(joined) !== bytes) return null;
    return joined;
  } catch {
    return null;
  }
}

function isGenerationStamp(value: string | null): value is string {
  return !!value && /^[a-f0-9]{8,64}$/.test(value);
}

async function readSecureBody(draftKey: string): Promise<string | null> {
  try {
    const stamp = await SecureStore.getItemAsync(`${draftKey}.sec.current`);
    if (isGenerationStamp(stamp)) {
      const current = await readSecureSlot(draftKey, `sec.p.${stamp}`);
      if (current) return current;
    }
  } catch {
    // The previous chunk layout below can still be read.
  }
  return await readSecureSlot(draftKey, "sec");
}

async function deleteSlot(draftKey: string, slot: string): Promise<void> {
  const header = await SecureStore.getItemAsync(`${draftKey}.${slot}.n`);
  if (!header) return;
  const count = Number(header.split(":")[0]);
  if (!Number.isInteger(count) || count <= 0 || count >= 1000) {
    throw new Error("secure header");
  }
  for (let index = 0; index < count; index += 1) {
    await SecureStore.deleteItemAsync(`${draftKey}.${slot}.${index}`);
  }
  await SecureStore.deleteItemAsync(`${draftKey}.${slot}.n`);
}

async function deleteAllSecureCopies(draftKey: string): Promise<void> {
  const stamp = await SecureStore.getItemAsync(`${draftKey}.sec.current`);
  if (isGenerationStamp(stamp)) {
    await deleteSlot(draftKey, `sec.p.${stamp}`);
    await SecureStore.deleteItemAsync(`${draftKey}.sec.current`);
  }
  const legacy = await SecureStore.getItemAsync(`${draftKey}.sec.n`);
  if (legacy) await deleteSecureChunks(draftKey, legacy);
}

/**
 * Stages a new generation, then points at it.
 * `plain` is the report JSON. Device encryption is expo-secure-store, not this function.
 * The previous generation stays readable until that pointer is stored.
 */
async function writeSecureBody(
  draftKey: string,
  plain: string,
  stillCurrent: () => boolean
): Promise<boolean> {
  const chunks = splitForSecureStore(plain);
  if (!chunks || chunks.length === 0) return false;
  for (const chunk of chunks) {
    if (utf8Size(chunk) > SECURE_VALUE_LIMIT) return false;
  }
  const stamp = createDraftKey().slice(0, 16);
  const slot = `sec.p.${stamp}`;
  try {
    if (!stillCurrent()) return false;
    for (let index = 0; index < chunks.length; index += 1) {
      await SecureStore.setItemAsync(`${draftKey}.${slot}.${index}`, chunks[index]);
      if (!stillCurrent()) return false;
    }
    await SecureStore.setItemAsync(
      `${draftKey}.${slot}.n`,
      `${chunks.length}:${utf8Size(plain)}`
    );
    if ((await readSecureSlot(draftKey, slot)) !== plain) return false;
    if (!stillCurrent()) return false;
    const previous = await SecureStore.getItemAsync(`${draftKey}.sec.current`);
    await SecureStore.setItemAsync(`${draftKey}.sec.current`, stamp);
    if (!stillCurrent()) {
      const seen = await SecureStore.getItemAsync(`${draftKey}.sec.current`);
      if (seen === stamp) {
        if (isGenerationStamp(previous)) {
          await SecureStore.setItemAsync(`${draftKey}.sec.current`, previous);
        } else {
          await SecureStore.deleteItemAsync(`${draftKey}.sec.current`);
        }
      }
      return false;
    }
    if ((await SecureStore.getItemAsync(`${draftKey}.sec.current`)) !== stamp) {
      return false;
    }
    if ((await readSecureSlot(draftKey, slot)) !== plain) return false;
    try {
      if (isGenerationStamp(previous) && previous !== stamp) {
        await deleteSlot(draftKey, `sec.p.${previous}`);
      }
      const legacy = await SecureStore.getItemAsync(`${draftKey}.sec.n`);
      if (legacy) await deleteSecureChunks(draftKey, legacy);
    } catch {
      // The current pointer already names a complete copy.
    }
    return true;
  } catch {
    return false;
  }
}

function tombstoneStorageKey(draftKey: string): string {
  return `${draftKey}.submitted`;
}

function attemptFromTombstone(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { attemptId?: unknown };
    return typeof parsed.attemptId === "string" && parsed.attemptId
      ? parsed.attemptId
      : null;
  } catch {
    return null;
  }
}

export type SubmissionStatus =
  | { state: "none" }
  | { state: "submitted"; attemptId: string }
  | { state: "unreadable" };

type TombstoneRead =
  | { state: "absent" }
  | { state: "submitted"; attemptId: string }
  | { state: "failed" };

async function readTombstoneStore(
  read: () => Promise<string | null>
): Promise<TombstoneRead> {
  try {
    const raw = await read();
    if (raw == null) return { state: "absent" };
    const attemptId = attemptFromTombstone(raw);
    return attemptId
      ? { state: "submitted", attemptId }
      : { state: "failed" };
  } catch {
    return { state: "failed" };
  }
}

/**
 * `none` is two successful reads with no tombstone. A throw or a value that is
 * not a tombstone is `unreadable`: the body stays, and that attempt must not send.
 */
export async function readSubmissionStatus(
  key: string
): Promise<SubmissionStatus> {
  const name = tombstoneStorageKey(key);
  const fromAsync = await readTombstoneStore(() => AsyncStorage.getItem(name));
  if (fromAsync.state === "submitted") return fromAsync;
  const fromSecure = await readTombstoneStore(() =>
    SecureStore.getItemAsync(name)
  );
  if (fromSecure.state === "submitted") return fromSecure;
  if (fromAsync.state === "failed" || fromSecure.state === "failed") {
    return { state: "unreadable" };
  }
  return { state: "none" };
}

export function resendDecision(
  status: SubmissionStatus,
  attemptId: string
): "blocked_unreadable" | "blocked_submitted" | "open" {
  if (status.state === "unreadable") return "blocked_unreadable";
  if (status.state === "submitted" && status.attemptId === attemptId) {
    return "blocked_submitted";
  }
  return "open";
}

/** Attempt id when this key is known submitted. Unreadable and absent are null. */
export async function readSubmittedAttempt(key: string): Promise<string | null> {
  const status = await readSubmissionStatus(key);
  return status.state === "submitted" ? status.attemptId : null;
}

async function writeSubmittedTombstone(
  key: string,
  attemptId: string
): Promise<boolean> {
  const value = JSON.stringify({ attemptId });
  const name = tombstoneStorageKey(key);
  try {
    await AsyncStorage.setItem(name, value);
  } catch {
    // SecureStore can still retain the tombstone.
  }
  try {
    await SecureStore.setItemAsync(name, value);
  } catch {
    // AsyncStorage can still retain the tombstone.
  }
  const status = await readSubmissionStatus(key);
  return status.state === "submitted" && status.attemptId === attemptId;
}

function attemptIdOf(plain: string | null): string | null {
  return parseReportDraft(plain)?.attemptId ?? null;
}

async function existingDraftKey(): Promise<string | null> {
  if (memoryDraftKey) return memoryDraftKey;
  try {
    const existing = await SecureStore.getItemAsync(DRAFT_KEY_NAME);
    if (existing) {
      memoryDraftKey = existing;
      return existing;
    }
  } catch {
    return null;
  }
  return null;
}

async function deleteSecureChunks(key: string, header: string): Promise<void> {
  const count = Number(header.split(":")[0]);
  if (!Number.isInteger(count) || count <= 0 || count >= 1000) {
    throw new Error("secure header");
  }
  for (let index = 0; index < count; index += 1) {
    await SecureStore.deleteItemAsync(`${key}.sec.${index}`);
  }
  await SecureStore.deleteItemAsync(`${key}.sec.n`);
}

/**
 * Removes copies of this attempt only. A different attempt on the same key is
 * unsent work and stays. A copy we cannot attribute stays too.
 */
async function clearDraftBodies(
  key: string,
  attemptId: string
): Promise<boolean> {
  let cleared = true;

  let header: string | null = null;
  let pointer: string | null = null;
  let copiesKnown = true;
  try {
    header = await SecureStore.getItemAsync(`${key}.sec.n`);
    pointer = await SecureStore.getItemAsync(`${key}.sec.current`);
  } catch {
    copiesKnown = false;
    cleared = false;
  }

  if (copiesKnown) {
    const storedAttempt = attemptIdOf(await readSecureBody(key));
    if (storedAttempt === attemptId) {
      try {
        await deleteAllSecureCopies(key);
      } catch {
        cleared = false;
      }
    } else if (storedAttempt == null && (header || pointer)) {
      cleared = false;
    }
  }

  const raw = await readStoredRaw(key);
  if (raw === "unreadable") {
    cleared = false;
  } else if (raw !== "missing") {
    const keyMaterial = raw.startsWith(DRAFT_PROTECT_PREFIX)
      ? await existingDraftKey()
      : null;
    const storedAttempt = attemptIdOf(plainDraft(raw, keyMaterial));
    if (storedAttempt === attemptId) {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        cleared = false;
      }
    } else if (storedAttempt == null) {
      cleared = false;
    }
  }

  return cleared;
}

export async function commitSubmittedDraft(
  key: string,
  attemptId: string
): Promise<{ submitted: boolean; cleared: boolean }> {
  const submitted = await writeSubmittedTombstone(key, attemptId);
  if (!submitted) return { submitted: false, cleared: false };
  return { submitted: true, cleared: await clearDraftBodies(key, attemptId) };
}

function hideSubmitted<T>(
  draft: ReportDraft<T> | null,
  submittedAttempt: string | null
): ReportDraft<T> | null {
  if (!draft || !submittedAttempt) return draft;
  return draft.attemptId === submittedAttempt ? null : draft;
}

export async function readReportDraft<T>(
  key: string
): Promise<ReportDraft<T> | null> {
  const status = await readSubmissionStatus(key);
  const submittedAttempt =
    status.state === "submitted" ? status.attemptId : null;
  const secure = hideSubmitted(
    parseReportDraft<T>(await readSecureBody(key)),
    submittedAttempt
  );
  const raw = await readStoredRaw(key);
  const stored =
    raw === "missing" || raw === "unreadable"
      ? null
      : plainDraft(
          raw,
          raw.startsWith(DRAFT_PROTECT_PREFIX) ? await draftKey() : null
        );
  const fromStored = hideSubmitted(
    stored == null ? null : parseReportDraft<T>(stored),
    submittedAttempt
  );
  if (secure && fromStored) {
    return Date.parse(secure.updatedAt) > Date.parse(fromStored.updatedAt)
      ? secure
      : fromStored;
  }
  return secure ?? fromStored;
}

export async function writeReportDraft<T>(
  key: string,
  draft: ReportDraft<T>
): Promise<boolean> {
  const status = await readSubmissionStatus(key);
  if (status.state === "submitted" && status.attemptId === draft.attemptId) {
    return false;
  }
  if (status.state === "unreadable") {
    const alreadyStored = await readStoredRaw(key);
    if (alreadyStored !== "missing" || (await readSecureBody(key))) return false;
  }
  const existingRaw = await readStoredRaw(key);
  if (existingRaw === "unreadable") return false;
  const keyMaterial = await draftKey();
  if (!keyMaterial) return false;
  if (
    typeof existingRaw === "string" &&
    existingRaw.startsWith(DRAFT_PROTECT_PREFIX) &&
    revealDraftPayload(existingRaw, keyMaterial) == null
  ) {
    return false;
  }
  const token = (writeEpoch.get(key) ?? 0) + 1;
  writeEpoch.set(key, token);

  try {
    if (writeEpoch.get(key) !== token) return false;
    const existing = await readReportDraft<T>(key);
    if (writeEpoch.get(key) !== token) return false;
    if (existing && !draftWriteMayReplace(existing, draft)) return false;
    const secured = await writeSecureBody(
      key,
      JSON.stringify(draft),
      () => writeEpoch.get(key) === token
    );
    if (!secured) return false;
    if (!sameStoredDraft(await readReportDraft<T>(key), draft)) return false;
    if ((await readStoredRaw(key)) !== "missing") {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        return false;
      }
      if ((await readStoredRaw(key)) !== "missing") return false;
    }
    return sameStoredDraft(await readReportDraft<T>(key), draft);
  } catch {
    return false;
  }
}

function sameStoredDraft<T>(
  stored: ReportDraft<T> | null,
  draft: ReportDraft<T>
): boolean {
  if (!stored) return false;
  return (
    stored.attemptId === draft.attemptId &&
    stored.submitState === draft.submitState &&
    stored.updatedAt === draft.updatedAt &&
    JSON.stringify(stored.form) === JSON.stringify(draft.form)
  );
}

export async function writeDraftClaim(key: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(draftClaimStorageKey(key), "1");
    return true;
  } catch {
    return false;
  }
}

export async function readDraftClaim(key: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(draftClaimStorageKey(key));
    return raw === "1";
  } catch {
    return true;
  }
}

export async function removeDraftClaim(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(draftClaimStorageKey(key));
  } catch {
    // A leftover claim keeps the next launch from sending again.
  }
}

/** AsyncStorage body only. A successful save uses commitSubmittedDraft. */
export async function removeReportDraft(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // A leftover draft can be restored and checked before another send.
  }
}
