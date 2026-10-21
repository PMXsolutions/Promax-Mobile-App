import {
  MAIL_COOLDOWN_MS,
  classifyLoginError,
  evaluateMailCooldown,
  mailCooldownUntil,
  parseMailCooldown,
  readLoginErrorInput,
  roleDeniedFailure,
} from "@/libs/login-failure";
import {
  acquireSingleFlight,
  releaseSingleFlight,
} from "@/libs/single-flight";

const PLAY_TOAST =
  "Error sending mail. Too many mails sent. Retry in One hour time.";

describe("classifyLoginError", () => {
  it("keeps the Play mail-limit response on the sign-in screen and blocks another request", () => {
    const failure = classifyLoginError({ message: PLAY_TOAST, httpStatus: 500 });

    expect(failure.kind).toBe("mail_rate_limited");
    expect(failure.navigateToOtp).toBe(false);
    expect(failure.allowImmediateRetry).toBe(false);
    expect(failure.message).toContain(PLAY_TOAST);
    expect(failure.message).toContain("will not send another sign-in request");
  });

  it("does not treat a mail transport error as an unconfirmed-email OTP flow", () => {
    const failure = classifyLoginError({
      message: "Error sending mail.",
      httpStatus: 500,
    });

    expect(failure.kind).toBe("mail_send_failed");
    expect(failure.navigateToOtp).toBe(false);
  });

  it("still sends a genuine unconfirmed-email response to the code screen", () => {
    const failure = classifyLoginError({
      message:
        "Email Not Confirmed. An OTP has been sent to your mail to confirm your email",
    });

    expect(failure.kind).toBe("email_unconfirmed");
    expect(failure.navigateToOtp).toBe(true);
  });

  it("keeps invalid credentials distinct from the mail limit", () => {
    const failure = classifyLoginError({ message: "Invalid Login Attempt" });

    expect(failure.kind).toBe("invalid_credentials");
    expect(failure.navigateToOtp).toBe(false);
    expect(failure.allowImmediateRetry).toBe(true);
  });

  it("reports a timeout without signing the user in", () => {
    const failure = classifyLoginError(
      readLoginErrorInput({
        isAxiosError: true,
        code: "ECONNABORTED",
        message: "timeout of 30000ms exceeded",
      })
    );

    expect(failure.kind).toBe("timeout");
    expect(failure.message).toContain("not signed in");
  });

  it("reports a network drop when the server does not answer", () => {
    const failure = classifyLoginError(
      readLoginErrorInput({
        isAxiosError: true,
        message: "Network Error",
      })
    );

    expect(failure.kind).toBe("network");
  });

  it("does not start a session for a non-staff role", () => {
    const failure = roleDeniedFailure();

    expect(failure.kind).toBe("role_denied");
    expect(failure.message).toContain("No session was started");
  });
});

describe("mail cooldown", () => {
  const now = new Date("2026-10-21T07:00:00.000Z");

  it("blocks the same address for one hour and allows a different address", () => {
    const cooldown = {
      email: "Staff@Example.com",
      untilIso: mailCooldownUntil(now),
    };

    expect(new Date(cooldown.untilIso).getTime() - now.getTime()).toBe(
      MAIL_COOLDOWN_MS
    );
    expect(
      evaluateMailCooldown({
        cooldown,
        email: "staff@example.com",
        now: new Date(now.getTime() + 1000),
      }).blocked
    ).toBe(true);
    expect(
      evaluateMailCooldown({
        cooldown,
        email: "other@example.com",
        now: new Date(now.getTime() + 1000),
      }).blocked
    ).toBe(false);
  });

  it("allows the same address after the hour", () => {
    const cooldown = {
      email: "staff@example.com",
      untilIso: mailCooldownUntil(now),
    };

    expect(
      evaluateMailCooldown({
        cooldown,
        email: "staff@example.com",
        now: new Date(now.getTime() + MAIL_COOLDOWN_MS),
      }).blocked
    ).toBe(false);
  });

  it("ignores a corrupt stored cooldown instead of blocking sign-in", () => {
    expect(parseMailCooldown("not-json")).toBeNull();
    expect(parseMailCooldown(JSON.stringify({ email: "a@b.c" }))).toBeNull();
    expect(
      parseMailCooldown(
        JSON.stringify({ email: "A@B.C", untilIso: "2026-10-21T08:00:00.000Z" })
      )
    ).toEqual({
      email: "a@b.c",
      untilIso: "2026-10-21T08:00:00.000Z",
    });
  });
});

describe("single flight sign-in", () => {
  it("ignores a second tap while the first request is still running", () => {
    const lock = { held: false };

    expect(acquireSingleFlight(lock)).toBe(true);
    expect(acquireSingleFlight(lock)).toBe(false);
    releaseSingleFlight(lock);
    expect(acquireSingleFlight(lock)).toBe(true);
  });
});
