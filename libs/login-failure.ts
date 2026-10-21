export type LoginFailureKind =
  | "user_not_found"
  | "invalid_credentials"
  | "email_unconfirmed"
  | "mail_rate_limited"
  | "network"
  | "timeout"
  | "session"
  | "role_denied"
  | "missing_token"
  | "unknown";

export interface LoginFailure {
  kind: LoginFailureKind;
  title: string;
  message: string;
  /** OTP is only for a real unconfirmed-email response, never for a mail transport failure. */
  navigateToOtp: boolean;
  /** False means the client must not call auth_login again until the user changes something or a cooldown ends. */
  allowImmediateRetry: boolean;
}

export interface LoginErrorInput {
  message?: string;
  httpStatus?: number;
  noResponse?: boolean;
  timedOut?: boolean;
}

export interface MailCooldownRecord {
  email: string;
  untilIso: string;
}

export const MAIL_COOLDOWN_MS = 60 * 60 * 1000;

const PLAY_MAIL_RATE_LIMIT =
  /too many mails sent/i;

export function isLoginTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    isAxiosError?: boolean;
    code?: string;
    response?: unknown;
  };
  return (
    candidate.isAxiosError === true &&
    candidate.response == null &&
    candidate.code === "ECONNABORTED"
  );
}

const unconfirmedEmails = new Set<string>();

export function rememberUnconfirmedEmail(email: string): void {
  const normalized = normalizeLoginEmail(email);
  if (!normalized) return;
  unconfirmedEmails.add(normalized);
}

export function emailAwaitingConfirmation(email: string): boolean {
  return unconfirmedEmails.has(normalizeLoginEmail(email));
}

export function resetUnconfirmedEmailsForTests(): void {
  unconfirmedEmails.clear();
}

export function isMailLimitMessage(message: string | undefined): boolean {
  if (!message) return false;
  return (
    PLAY_MAIL_RATE_LIMIT.test(message) || /error sending mail/i.test(message)
  );
}

export function signInRepeatDecision(
  previousEmail: string | null,
  email: string
): "post" | "otp" {
  if (emailAwaitingConfirmation(email)) return "otp";
  if (!previousEmail) return "post";
  if (normalizeLoginEmail(previousEmail) !== normalizeLoginEmail(email)) {
    return "post";
  }
  return "otp";
}

export function unreadableMailLimitFailure(): LoginFailure {
  return {
    kind: "session",
    title: "Sign-in limit unavailable",
    message:
      "This device could not read the sign-in limit, so this attempt was not sent.",
    navigateToOtp: false,
    allowImmediateRetry: true,
  };
}

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function mailCooldownUntil(now: Date): string {
  return new Date(now.getTime() + MAIL_COOLDOWN_MS).toISOString();
}

export function parseMailCooldown(raw: string | null): MailCooldownRecord | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<MailCooldownRecord>;
    if (!parsed.email || !parsed.untilIso) return null;
    if (Number.isNaN(new Date(parsed.untilIso).getTime())) return null;
    return {
      email: normalizeLoginEmail(parsed.email),
      untilIso: parsed.untilIso,
    };
  } catch {
    return null;
  }
}

export interface MailCooldownBook {
  entries: MailCooldownRecord[];
}

export function parseMailCooldownBook(raw: string | null): MailCooldownBook {
  if (!raw) return { entries: [] };

  try {
    const parsed = JSON.parse(raw) as
      | Partial<MailCooldownRecord>
      | { entries?: unknown };
    if (parsed && typeof parsed === "object" && "entries" in parsed) {
      const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
      return {
        entries: entries
          .map((entry) => parseMailCooldown(JSON.stringify(entry)))
          .filter((entry): entry is MailCooldownRecord => entry != null),
      };
    }
  } catch {
    return { entries: [] };
  }

  const single = parseMailCooldown(raw);
  return single ? { entries: [single] } : { entries: [] };
}

export function upsertMailCooldown(
  book: MailCooldownBook,
  record: MailCooldownRecord,
  now: Date
): MailCooldownBook {
  const email = normalizeLoginEmail(record.email);
  const kept = book.entries.filter((entry) => {
    if (normalizeLoginEmail(entry.email) === email) return false;
    const until = new Date(entry.untilIso).getTime();
    return !Number.isNaN(until) && until > now.getTime();
  });
  return {
    entries: [...kept, { email, untilIso: record.untilIso }],
  };
}

export function cooldownForEmail(
  book: MailCooldownBook | null,
  email: string
): MailCooldownRecord | null {
  if (!book) return null;
  const wanted = normalizeLoginEmail(email);
  return (
    book.entries.find((entry) => normalizeLoginEmail(entry.email) === wanted) ??
    null
  );
}

const LOGIN_MESSAGE_KEYS = [
  "message",
  "Message",
  "title",
  "Title",
  "detail",
  "Detail",
] as const;

function collectLoginMessages(value: unknown, depth: number): string[] {
  if (depth > 5 || value == null) return [];
  if (typeof value === "string") return [value];
  if (typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectLoginMessages(item, depth + 1));
  }

  const record = value as Record<string, unknown>;
  const found: string[] = [];
  for (const key of LOGIN_MESSAGE_KEYS) {
    if (typeof record[key] === "string") found.push(record[key]);
  }
  for (const key of ["response", "Response", "error", "Error", "errors", "Errors"]) {
    if (key in record) {
      found.push(...collectLoginMessages(record[key], depth + 1));
    }
  }
  return found;
}

/** Prefer the known mail-limit sentence over a generic message in the same body. */
export function messageFromLoginPayload(payload: unknown): string | undefined {
  const messages = collectLoginMessages(payload, 0)
    .map((message) => message.trim())
    .filter((message) => message.length > 0);
  return (
    messages.find((message) => PLAY_MAIL_RATE_LIMIT.test(message)) ||
    messages.find((message) => /error sending mail/i.test(message)) ||
    messages[0]
  );
}

export function readLoginErrorInput(error: unknown): LoginErrorInput {
  if (!error || typeof error !== "object") {
    return {
      message: error instanceof Error ? error.message : undefined,
      noResponse: true,
    };
  }

  const candidate = error as {
    isAxiosError?: boolean;
    message?: string;
    code?: string;
    response?: {
      status?: number;
      data?: { message?: string; Message?: string };
    };
  };

  if (!candidate.isAxiosError) {
    return {
      message: candidate.message,
      noResponse: true,
    };
  }

  const data = candidate.response?.data;
  return {
    message: messageFromLoginPayload(data) || candidate.message,
    httpStatus: candidate.response?.status,
    noResponse: !candidate.response,
    timedOut: candidate.code === "ECONNABORTED",
  };
}

function isEmailUnconfirmed(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized === "email not confirmed" ||
    normalized.startsWith("email not confirmed.")
  );
}

export function classifyLoginError(input: LoginErrorInput): LoginFailure {
  const message = input.message?.trim();

  if (message && PLAY_MAIL_RATE_LIMIT.test(message)) {
    return mailRateLimitFailure(message);
  }

  if (message && /error sending mail/i.test(message)) {
    return mailRateLimitFailure(message);
  }

  if (input.timedOut) {
    return {
      kind: "timeout",
      title: "Sign-in timed out",
      message:
        "The sign-in request did not finish. Check your connection and try again. You are not signed in.",
      navigateToOtp: false,
      allowImmediateRetry: true,
    };
  }

  if (input.noResponse) {
    return {
      kind: "network",
      title: "Cannot reach PromaxCare",
      message:
        "Sign-in could not reach the server. Check your connection and try again. You are not signed in.",
      navigateToOtp: false,
      allowImmediateRetry: true,
    };
  }

  if (message && isEmailUnconfirmed(message)) {
    return {
      kind: "email_unconfirmed",
      title: "Confirm your email",
      message:
        "This account still needs email confirmation. Continue to the code screen. Your password was not stored as a session.",
      navigateToOtp: true,
      allowImmediateRetry: false,
    };
  }

  if (message && message.toLowerCase() === "user not found") {
    return {
      kind: "user_not_found",
      title: "User not found",
      message: "No account was found for that email. You are not signed in.",
      navigateToOtp: false,
      allowImmediateRetry: true,
    };
  }

  if (message && message.toLowerCase() === "invalid login attempt") {
    return {
      kind: "invalid_credentials",
      title: "Incorrect email or password",
      message: "Those details were not accepted. You are not signed in.",
      navigateToOtp: false,
      allowImmediateRetry: true,
    };
  }

  if (input.httpStatus === 401) {
    return {
      kind: "session",
      title: "Sign-in was not accepted",
      message:
        message ||
        "The server rejected the sign-in. You are not signed in.",
      navigateToOtp: false,
      allowImmediateRetry: true,
    };
  }

  return {
    kind: "unknown",
    title: "Unable to sign in",
    message: message || "Sign-in did not succeed. You are not signed in.",
    navigateToOtp: false,
    allowImmediateRetry: true,
  };
}

export function mailRateLimitFailure(serverMessage: string): LoginFailure {
  return {
    kind: "mail_rate_limited",
    title: "Email could not be sent",
    message: `PromaxCare could not send a verification email (${serverMessage}). Wait one hour before trying this address again. This app will not send another sign-in request for it until then.`,
    navigateToOtp: false,
    allowImmediateRetry: false,
  };
}

export function evaluateMailCooldown(input: {
  cooldown: MailCooldownRecord | null;
  email: string;
  now: Date;
}): { blocked: boolean; failure: LoginFailure | null } {
  if (!input.cooldown) {
    return { blocked: false, failure: null };
  }

  if (
    normalizeLoginEmail(input.cooldown.email) !==
    normalizeLoginEmail(input.email)
  ) {
    return { blocked: false, failure: null };
  }

  const until = new Date(input.cooldown.untilIso).getTime();
  if (Number.isNaN(until) || until <= input.now.getTime()) {
    return { blocked: false, failure: null };
  }

  return {
    blocked: true,
    failure: mailRateLimitFailure(
      "Too many mails sent. Retry in One hour time."
    ),
  };
}

export function roleDeniedFailure(): LoginFailure {
  return {
    kind: "role_denied",
    title: "Staff sign-in only",
    message:
      "This app is for staff accounts. Other roles should use the PromaxCare website. No session was started.",
    navigateToOtp: false,
    allowImmediateRetry: true,
  };
}

export function missingTokenFailure(): LoginFailure {
  return {
    kind: "missing_token",
    title: "Sign-in incomplete",
    message:
      "The server did not return an access token, so you are not signed in. Try again. If it keeps happening, contact your office.",
    navigateToOtp: false,
    allowImmediateRetry: true,
  };
}
