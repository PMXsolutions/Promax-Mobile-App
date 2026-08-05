import { UserProfileType } from "@/types/auth";

type AuthUser = Omit<UserProfileType, "token">;

/** Decode JWT exp (seconds since epoch) without verifying signature — client UX only. */
export const readJwtExpiryMs = (token: string | null): number | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const data = JSON.parse(json) as { exp?: number };
    if (typeof data.exp !== "number" || !Number.isFinite(data.exp)) return null;
    return data.exp * 1000;
  } catch {
    return null;
  }
};

/**
 * Fail-closed client session check (Wave-10/11B).
 * Prefer server-issued tokenExpiration; fall back to JWT exp; otherwise require reauthentication.
 */
export const isAuthSessionExpired = (
  user: AuthUser | null,
  token: string | null
): boolean => {
  if (!token || !user) return true;

  if (user.tokenExpiration) {
    const expiresAt = Date.parse(user.tokenExpiration);
    if (!Number.isNaN(expiresAt)) {
      return expiresAt <= Date.now();
    }
  }

  const jwtExp = readJwtExpiryMs(token);
  if (jwtExp != null) {
    return jwtExp <= Date.now();
  }

  // Missing/malformed expiry must not create an indefinite session.
  return true;
};

export type ClientAuthFailure =
  | "expired"
  | "revoked"
  | "tenant_denied"
  | "network"
  | "ok";

/** Map HTTP status + API code for UI draft-preserve / warn (Wave-11B). */
export const mapAuthFailure = (
  status?: number,
  code?: string
): ClientAuthFailure => {
  if (!status) return "network";
  if (status === 403) return "tenant_denied";
  if (status === 401) {
    if (
      code === "reuse_detected" ||
      code === "user_ineligible" ||
      code === "org_or_user_blocked"
    )
      return "revoked";
    return "expired";
  }
  return "ok";
};
