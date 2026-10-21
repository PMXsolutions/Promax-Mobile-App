import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReportDraft, parseReportDraft } from "@/libs/report-draft";

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
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // The form still holds the text for this visit.
  }
}

export async function removeReportDraft(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // A leftover draft can be restored and checked before another send.
  }
}
