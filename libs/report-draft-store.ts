import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ReportDraft,
  draftClaimStorageKey,
  draftWriteMayReplace,
  parseReportDraft,
} from "@/libs/report-draft";

const writeEpoch = new Map<string, number>();
const latestPayload = new Map<string, string>();

export async function readReportDraft<T>(
  key: string
): Promise<ReportDraft<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return parseReportDraft<T>(raw);
  } catch {
    return null;
  }
}

export async function writeReportDraft<T>(
  key: string,
  draft: ReportDraft<T>
): Promise<boolean> {
  const token = (writeEpoch.get(key) ?? 0) + 1;
  writeEpoch.set(key, token);
  latestPayload.set(key, JSON.stringify(draft));

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
      if (writeEpoch.get(key) === currentToken) return true;
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
