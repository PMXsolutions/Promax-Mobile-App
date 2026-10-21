import fs from "fs";
import path from "path";
import { shouldRetryQuery } from "@/libs/session-status";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

describe("expired session retry", () => {
  it("does not retry a query after the session has expired", () => {
    const expired = { response: { status: 401 } };

    expect(shouldRetryQuery(0, expired)).toBe(false);
    expect(shouldRetryQuery(1, expired)).toBe(false);
  });

  it("still retries a query that failed without ending the session", () => {
    const server = { response: { status: 500 } };
    const denied = { response: { status: 403 } };

    expect(shouldRetryQuery(0, server)).toBe(true);
    expect(shouldRetryQuery(2, server)).toBe(true);
    expect(shouldRetryQuery(3, server)).toBe(false);
    expect(shouldRetryQuery(0, denied)).toBe(true);
    expect(shouldRetryQuery(0, new Error("Network Error"))).toBe(true);
  });

  it("wires query retry to the session rule and does not retry mutations", () => {
    const source = read("libs/query.ts");

    expect(source).toContain("retry: shouldRetryQuery");
    expect(source).not.toContain("mutations");
  });
});

describe("duplicate mail and reset handling", () => {
  it("takes the single-flight lock before a forgot-password mail request", () => {
    const source = read("modules/auth/forgot-password-form.tsx");
    const lockAt = source.indexOf("acquireSingleFlight");
    const mailAt = source.indexOf("AuthService.forgotPassword");

    expect(lockAt).toBeGreaterThan(-1);
    expect(lockAt).toBeLessThan(mailAt);
    expect(source.indexOf("releaseSingleFlight(flight")).toBeGreaterThan(mailAt);
  });

  it("takes the single-flight lock before a password reset", () => {
    const source = read("modules/auth/change-password-form.tsx");
    const lockAt = source.indexOf("acquireSingleFlight");
    const resetAt = source.indexOf("AuthService.resetPassword");

    expect(lockAt).toBeGreaterThan(-1);
    expect(lockAt).toBeLessThan(resetAt);
    expect(source.indexOf("releaseSingleFlight(flight")).toBeGreaterThan(resetAt);
  });
});

describe("change-password keyboard taps", () => {
  it("lets the reset button receive a tap while the keyboard is open", () => {
    expect(read("modules/auth/change-password-form.tsx")).toContain(
      'keyboardShouldPersistTaps="handled"'
    );
  });
});
