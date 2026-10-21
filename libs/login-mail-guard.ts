import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  MailCooldownBook,
  MailCooldownRecord,
  listUnconfirmedEmails,
  mergeMailCooldownBooks,
  normalizeLoginEmail,
  parseMailCooldownBook,
  rememberUnconfirmedEmail,
  restoreUnconfirmedEmails,
  upsertMailCooldown,
} from "@/libs/login-failure";

export const MAIL_COOLDOWN_STORAGE_KEY = "promaxcare.login-mail-cooldown";
export const UNCONFIRMED_EMAIL_STORAGE_KEY = "promaxcare.login-unconfirmed";

let memoryBook: MailCooldownBook | null = null;
let readFailed = false;
let unconfirmedFailed = false;

export function resetMailCooldownMemoryForTests(): void {
  memoryBook = null;
  readFailed = false;
  unconfirmedFailed = false;
}

export function mailCooldownReadFailed(): boolean {
  return readFailed;
}

export function unconfirmedReadFailed(): boolean {
  return unconfirmedFailed;
}

async function readBoth(
  key: string
): Promise<{ raws: string[]; unreadable: boolean }> {
  const raws: string[] = [];
  let failures = 0;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) raws.push(raw);
  } catch {
    failures += 1;
  }
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (raw) raws.push(raw);
  } catch {
    failures += 1;
  }
  return { raws, unreadable: failures === 2 };
}

async function writeBoth(key: string, value: string): Promise<boolean> {
  let stored = false;
  try {
    await AsyncStorage.setItem(key, value);
    stored = true;
  } catch {
    stored = false;
  }
  try {
    await SecureStore.setItemAsync(key, value);
    stored = true;
  } catch {
    // The other store may already hold this record.
  }
  return stored;
}

export async function loadMailCooldownBook(): Promise<MailCooldownBook> {
  if (memoryBook) return memoryBook;

  const read = await readBoth(MAIL_COOLDOWN_STORAGE_KEY);
  if (read.unreadable) {
    readFailed = true;
    return { entries: [] };
  }

  readFailed = false;
  memoryBook = read.raws.reduce(
    (book, raw) => mergeMailCooldownBooks(book, parseMailCooldownBook(raw)),
    { entries: [] } as MailCooldownBook
  );
  return memoryBook;
}

export async function loadUnconfirmedEmails(): Promise<void> {
  const read = await readBoth(UNCONFIRMED_EMAIL_STORAGE_KEY);
  if (read.unreadable) {
    unconfirmedFailed = true;
    return;
  }
  unconfirmedFailed = false;
  const emails: string[] = [];
  for (const raw of read.raws) {
    try {
      const parsed = JSON.parse(raw) as { emails?: unknown };
      if (!Array.isArray(parsed.emails)) continue;
      for (const email of parsed.emails) {
        if (typeof email === "string") emails.push(email);
      }
    } catch {
      // A corrupt copy is ignored. The other copy can still restore the address.
    }
  }
  restoreUnconfirmedEmails(emails);
}

export async function persistUnconfirmedEmail(email: string): Promise<boolean> {
  rememberUnconfirmedEmail(email);
  return writeBoth(
    UNCONFIRMED_EMAIL_STORAGE_KEY,
    JSON.stringify({ emails: listUnconfirmedEmails() })
  );
}

export async function saveMailCooldown(
  record: MailCooldownRecord
): Promise<boolean> {
  let current = memoryBook;
  if (!current) {
    const read = await readBoth(MAIL_COOLDOWN_STORAGE_KEY);
    current = read.unreadable
      ? { entries: [] }
      : read.raws.reduce(
          (book, raw) => mergeMailCooldownBooks(book, parseMailCooldownBook(raw)),
          { entries: [] } as MailCooldownBook
        );
  }

  memoryBook = upsertMailCooldown(
    current,
    {
      email: normalizeLoginEmail(record.email),
      untilIso: record.untilIso,
    },
    new Date()
  );

  return writeBoth(MAIL_COOLDOWN_STORAGE_KEY, JSON.stringify(memoryBook));
}
