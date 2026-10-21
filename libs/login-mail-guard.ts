import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
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

function sandboxPath(name: string): string | null {
  const root = FileSystem.documentDirectory;
  if (!root) return null;
  return `${root}${name}`;
}

async function readSandbox(name: string): Promise<string | null> {
  const path = sandboxPath(name);
  if (!path || typeof FileSystem.readAsStringAsync !== "function") return null;
  try {
    const raw = await FileSystem.readAsStringAsync(path);
    return raw || null;
  } catch {
    return null;
  }
}

async function writeSandbox(name: string, value: string): Promise<boolean> {
  const path = sandboxPath(name);
  if (!path || typeof FileSystem.writeAsStringAsync !== "function") return false;
  try {
    await FileSystem.writeAsStringAsync(path, value);
    return true;
  } catch {
    return false;
  }
}

async function readCopies(
  key: string
): Promise<{ raws: string[]; unreadable: boolean }> {
  const raws: string[] = [];
  let primaryFailures = 0;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) raws.push(raw);
  } catch {
    primaryFailures += 1;
  }
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (raw) raws.push(raw);
  } catch {
    primaryFailures += 1;
  }
  const sandbox = await readSandbox(key);
  if (sandbox) raws.push(sandbox);
  return {
    raws,
    unreadable: primaryFailures === 2 && raws.length === 0,
  };
}

async function writeCopies(key: string, value: string): Promise<boolean> {
  let stored = false;
  try {
    await AsyncStorage.setItem(key, value);
    stored = true;
  } catch {
    // SecureStore or the sandbox file can still hold this record.
  }
  try {
    await SecureStore.setItemAsync(key, value);
    stored = true;
  } catch {
    // The sandbox file can still hold this record.
  }
  if (await writeSandbox(key, value)) stored = true;
  return stored;
}

export async function loadMailCooldownBook(): Promise<MailCooldownBook> {
  const read = await readCopies(MAIL_COOLDOWN_STORAGE_KEY);
  if (read.unreadable) {
    readFailed = true;
    return memoryBook ?? { entries: [] };
  }

  const disk = read.raws.reduce(
    (book, raw) => mergeMailCooldownBooks(book, parseMailCooldownBook(raw)),
    { entries: [] } as MailCooldownBook
  );
  memoryBook = memoryBook ? mergeMailCooldownBooks(memoryBook, disk) : disk;
  readFailed = false;
  return memoryBook;
}

export async function loadUnconfirmedEmails(): Promise<void> {
  const read = await readCopies(UNCONFIRMED_EMAIL_STORAGE_KEY);
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
  return writeCopies(
    UNCONFIRMED_EMAIL_STORAGE_KEY,
    JSON.stringify({ emails: listUnconfirmedEmails() })
  );
}

export async function saveMailCooldown(
  record: MailCooldownRecord
): Promise<boolean> {
  let current = memoryBook;
  if (!current) {
    const read = await readCopies(MAIL_COOLDOWN_STORAGE_KEY);
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

  return writeCopies(MAIL_COOLDOWN_STORAGE_KEY, JSON.stringify(memoryBook));
}
