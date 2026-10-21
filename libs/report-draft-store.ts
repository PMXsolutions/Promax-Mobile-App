import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  DRAFT_PROTECT_PREFIX,
  ReportDraft,
  createDraftKey,
  draftClaimStorageKey,
  draftWriteMayReplace,
  parseReportDraft,
  protectDraftPayload,
  revealDraftPayload,
} from "@/libs/report-draft";

const DRAFT_KEY_NAME = "promaxcare.report-draft.key";
const SECURE_CHUNK_BYTES = 1800;
const SECURE_VALUE_LIMIT = 2048;

const writeEpoch = new Map<string, number>();
const latestPayload = new Map<string, string>();
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

async function readSecureBody(draftKey: string): Promise<string | null> {
  try {
    const header = await SecureStore.getItemAsync(`${draftKey}.sec.n`);
    if (!header) return null;
    const [countRaw, bytesRaw] = header.split(":");
    const count = Number(countRaw);
    const bytes = Number(bytesRaw);
    if (!Number.isInteger(count) || count <= 0 || !Number.isInteger(bytes)) {
      return null;
    }
    const parts: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const part = await SecureStore.getItemAsync(`${draftKey}.sec.${index}`);
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

async function writeSecureBody(draftKey: string, plain: string): Promise<boolean> {
  const chunks = splitForSecureStore(plain);
  if (!chunks || chunks.length === 0) return false;
  try {
    for (let index = 0; index < chunks.length; index += 1) {
      if (utf8Size(chunks[index]) > SECURE_VALUE_LIMIT) return false;
      await SecureStore.setItemAsync(`${draftKey}.sec.${index}`, chunks[index]);
    }
    await SecureStore.setItemAsync(
      `${draftKey}.sec.n`,
      `${chunks.length}:${utf8Size(plain)}`
    );
    return (await readSecureBody(draftKey)) === plain;
  } catch {
    return false;
  }
}

export async function readReportDraft<T>(
  key: string
): Promise<ReportDraft<T> | null> {
  const secure = parseReportDraft<T>(await readSecureBody(key));
  const raw = await readStoredRaw(key);
  const stored =
    raw === "missing" || raw === "unreadable"
      ? null
      : plainDraft(
          raw,
          raw.startsWith(DRAFT_PROTECT_PREFIX) ? await draftKey() : null
        );
  const fromStored = stored == null ? null : parseReportDraft<T>(stored);
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
  const existingRaw = await readStoredRaw(key);
  if (existingRaw === "unreadable") return false;
  const keyMaterial = await draftKey();
  if (
    typeof existingRaw === "string" &&
    existingRaw.startsWith(DRAFT_PROTECT_PREFIX) &&
    (!keyMaterial || revealDraftPayload(existingRaw, keyMaterial) == null)
  ) {
    return false;
  }
  const sealed = keyMaterial
    ? protectDraftPayload(JSON.stringify(draft), keyMaterial)
    : JSON.stringify(draft);
  const token = (writeEpoch.get(key) ?? 0) + 1;
  writeEpoch.set(key, token);
  latestPayload.set(key, sealed);

  try {
    let guard = 0;
    while (guard < 3) {
      guard += 1;
      if (writeEpoch.get(key) === token) {
        const existing = await readReportDraft<T>(key);
        if (existing && !draftWriteMayReplace(existing, draft)) return false;
      }
      const currentToken = writeEpoch.get(key);
      const currentPayload = latestPayload.get(key);
      if (currentToken == null || currentPayload == null) return false;
      await AsyncStorage.setItem(key, currentPayload);
      if (writeEpoch.get(key) === currentToken) {
        if (keyMaterial) {
          const plain = revealDraftPayload(currentPayload, keyMaterial);
          if (plain) await writeSecureBody(key, plain);
        }
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
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

export async function removeReportDraft(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // A leftover draft can be restored and checked before another send.
  }
}
