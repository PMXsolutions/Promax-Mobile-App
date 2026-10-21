import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import {
  MailCooldownBook,
  MailCooldownRecord,
  listUnconfirmedEmails,
  evaluateMailCooldown,
  mailCooldownUntil,
  mergeMailCooldownBooks,
  normalizeLoginEmail,
  parseMailCooldownBook,
  rememberUnconfirmedEmail,
  restoreUnconfirmedEmails,
  unreadableMailLimitFailure,
  unretainedSendIntentFailure,
  upsertMailCooldown,
} from "@/libs/login-failure";
import type { LoginFailure } from "@/libs/login-failure";

export const MAIL_COOLDOWN_STORAGE_KEY = "promaxcare.login-mail-cooldown";
export const UNCONFIRMED_EMAIL_STORAGE_KEY = "promaxcare.login-unconfirmed";
export const SEND_INTENT_STORAGE_KEY = "promaxcare.login-send-intent";

let memoryBook: MailCooldownBook | null = null;
let intentBook: MailCooldownBook | null = null;
let readFailed = false;
let unconfirmedFailed = false;
let intentUnreadable = false;

export function resetMailCooldownMemoryForTests(): void {
  memoryBook = null;
  intentBook = null;
  readFailed = false;
  unconfirmedFailed = false;
  intentUnreadable = false;
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

function bookFromRaws(raws: string[]): MailCooldownBook {
  return raws.reduce(
    (book, raw) => mergeMailCooldownBooks(book, parseMailCooldownBook(raw)),
    { entries: [] } as MailCooldownBook
  );
}

function intentStillHeld(
  book: MailCooldownBook,
  email: string,
  now: Date
): boolean {
  const row = book.entries.find(
    (entry) => normalizeLoginEmail(entry.email) === normalizeLoginEmail(email)
  );
  if (!row) return false;
  const until = new Date(row.untilIso).getTime();
  return !Number.isNaN(until) && until > now.getTime();
}

export async function loadSendIntentBook(): Promise<MailCooldownBook> {
  const read = await readCopies(SEND_INTENT_STORAGE_KEY);
  if (read.unreadable) {
    intentUnreadable = true;
    return intentBook ?? { entries: [] };
  }
  const disk = bookFromRaws(read.raws);
  intentBook = intentBook ? mergeMailCooldownBooks(intentBook, disk) : disk;
  intentUnreadable = false;
  return intentBook;
}

export async function reserveSendIntent(
  email: string,
  now: Date
): Promise<{ retained: true } | { retained: false; failure: LoginFailure }> {
  const normalized = normalizeLoginEmail(email);
  if (!normalized) {
    return { retained: false, failure: unretainedSendIntentFailure() };
  }

  const read = await readCopies(SEND_INTENT_STORAGE_KEY);
  if (read.unreadable) {
    intentUnreadable = true;
    return { retained: false, failure: unreadableMailLimitFailure() };
  }

  const disk = bookFromRaws(read.raws);
  const next = upsertMailCooldown(
    intentBook ? mergeMailCooldownBooks(intentBook, disk) : disk,
    { email: normalized, untilIso: mailCooldownUntil(now) },
    now
  );
  await writeCopies(SEND_INTENT_STORAGE_KEY, JSON.stringify(next));

  const check = await readCopies(SEND_INTENT_STORAGE_KEY);
  if (check.unreadable) {
    intentUnreadable = true;
    return { retained: false, failure: unreadableMailLimitFailure() };
  }
  const confirmed = bookFromRaws(check.raws);
  if (!intentStillHeld(confirmed, normalized, now)) {
    return { retained: false, failure: unretainedSendIntentFailure() };
  }
  intentBook = confirmed;
  intentUnreadable = false;
  return { retained: true };
}

export async function releaseSendIntent(email: string): Promise<boolean> {
  const current = intentBook ?? (await loadSendIntentBook());
  const normalized = normalizeLoginEmail(email);
  const next = {
    entries: current.entries.filter(
      (entry) => normalizeLoginEmail(entry.email) !== normalized
    ),
  };
  await writeCopies(SEND_INTENT_STORAGE_KEY, JSON.stringify(next));
  const check = await readCopies(SEND_INTENT_STORAGE_KEY);
  if (check.unreadable) return false;
  const confirmed = bookFromRaws(check.raws);
  intentBook = confirmed;
  return !intentStillHeld(confirmed, normalized, new Date());
}

export async function claimSignInSend(
  email: string,
  now: Date
): Promise<{ send: true } | { send: false; failure: LoginFailure }> {
  const cooldownBook = await loadMailCooldownBook();
  if (mailCooldownReadFailed()) {
    return { send: false, failure: unreadableMailLimitFailure() };
  }
  const cooled = evaluateMailCooldown({
    cooldown: cooldownBook.entries.find(
      (entry) => normalizeLoginEmail(entry.email) === normalizeLoginEmail(email)
    ) ?? null,
    email,
    now,
  });
  if (cooled.blocked && cooled.failure) {
    return { send: false, failure: cooled.failure };
  }

  const intents = await loadSendIntentBook();
  if (intentUnreadable) {
    return { send: false, failure: unreadableMailLimitFailure() };
  }
  if (intentStillHeld(intents, email, now)) {
    return {
      send: false,
      failure: {
        kind: "mail_rate_limited",
        title: "Sign-in already started",
        message:
          "A sign-in request for this email may already have been sent. This app will not send another until that hour ends.",
        navigateToOtp: false,
        allowImmediateRetry: false,
      },
    };
  }

  const reserved = await reserveSendIntent(email, now);
  if (!reserved.retained) return { send: false, failure: reserved.failure };
  return { send: true };
}
