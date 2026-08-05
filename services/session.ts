import axios from "axios";

const sessionApiBase = process.env.EXPO_PUBLIC_API_BASEURL?.trim() || "";
const sessionAxios = axios.create({
  baseURL: sessionApiBase || undefined,
  timeout: 30000,
});

sessionAxios.interceptors.request.use((config) => {
  if (!sessionApiBase) {
    return Promise.reject(
      new Error(
        "API base URL is not configured. Set EXPO_PUBLIC_API_BASEURL before session requests."
      )
    );
  }
  return config;
});

export type SessionFailureKind =
  | "expired"
  | "revoked"
  | "reuse_detected"
  | "tenant_denied"
  | "network"
  | "unknown";

export function classifySessionError(
  status?: number,
  code?: string
): SessionFailureKind {
  if (!status) return "network";
  if (status === 403) return "tenant_denied";
  if (status === 401) {
    if (code === "reuse_detected") return "revoked";
    if (
      code === "expired" ||
      code === "missing_refresh" ||
      code === "unknown_refresh"
    )
      return "expired";
    if (code === "user_ineligible" || code === "org_or_user_blocked")
      return "revoked";
    return "expired";
  }
  return "unknown";
}

type RefreshResult = {
  ok: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiration?: string;
  kind: SessionFailureKind;
};

let refreshInFlight: Promise<RefreshResult> | null = null;

/**
 * Single-flight refresh. Never logs tokens.
 */
export async function tryRefreshSession(args: {
  refreshToken: string;
  deviceId: string;
}): Promise<RefreshResult> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async (): Promise<RefreshResult> => {
    try {
      const { data } = await sessionAxios.post("/Session/refresh", {
        refreshToken: args.refreshToken,
        deviceId: args.deviceId,
      });
      const access = data?.Token || data?.token;
      const nextRefresh = data?.RefreshToken || data?.refreshToken;
      const exp = data?.TokenExpiration || data?.tokenExpiration;
      if (!access) return { ok: false, kind: "expired" };
      return {
        ok: true,
        accessToken: access,
        refreshToken: nextRefresh,
        tokenExpiration: exp,
        kind: "unknown",
      };
    } catch (e: unknown) {
      const err = e as {
        response?: { status?: number; data?: { Code?: string; code?: string } };
      };
      const kind = classifySessionError(
        err.response?.status,
        err.response?.data?.Code || err.response?.data?.code
      );
      return { ok: false, kind };
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function logoutRemoteSession(refreshToken: string | null) {
  if (!refreshToken) return;
  try {
    await sessionAxios.post("/Session/logout", { refreshToken });
  } catch {
    // best-effort
  }
}
