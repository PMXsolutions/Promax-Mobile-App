import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MailCooldownBook,
  MailCooldownRecord,
  normalizeLoginEmail,
  parseMailCooldownBook,
  upsertMailCooldown,
} from "@/libs/login-failure";

export const MAIL_COOLDOWN_STORAGE_KEY = "promaxcare.login-mail-cooldown";

let memoryBook: MailCooldownBook | null = null;

export function resetMailCooldownMemoryForTests(): void {
  memoryBook = null;
}

export async function loadMailCooldownBook(): Promise<MailCooldownBook> {
  if (memoryBook) return memoryBook;

  try {
    const raw = await AsyncStorage.getItem(MAIL_COOLDOWN_STORAGE_KEY);
    memoryBook = parseMailCooldownBook(raw);
    return memoryBook;
  } catch {
    return memoryBook ?? { entries: [] };
  }
}

export async function saveMailCooldown(
  record: MailCooldownRecord
): Promise<void> {
  let current = memoryBook;
  if (!current) {
    try {
      const raw = await AsyncStorage.getItem(MAIL_COOLDOWN_STORAGE_KEY);
      current = parseMailCooldownBook(raw);
    } catch {
      current = { entries: [] };
    }
  }

  memoryBook = upsertMailCooldown(
    current,
    {
      email: normalizeLoginEmail(record.email),
      untilIso: record.untilIso,
    },
    new Date()
  );

  try {
    await AsyncStorage.setItem(
      MAIL_COOLDOWN_STORAGE_KEY,
      JSON.stringify(memoryBook)
    );
  } catch {
    // The in-memory book still blocks another sign-in request in this session.
  }
}
