export const PUSH_TOKEN_STORAGE_KEY = "fcmToken";

export type ScopedPushRegistration = {
  token: string;
  userId: string;
  companyId: string;
};

export function scopePushIdentity(
  userId: number | string,
  companyId: number | string
): { userId: string; companyId: string } {
  return {
    userId: String(userId),
    companyId: String(Number(companyId)),
  };
}

/** A legacy value is the bare device token. That is not a user or company registration. */
export function parseScopedPushRegistration(
  raw: string | null
): ScopedPushRegistration | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ScopedPushRegistration>;
    if (
      typeof parsed.token !== "string" ||
      !parsed.token ||
      typeof parsed.userId !== "string" ||
      !parsed.userId ||
      typeof parsed.companyId !== "string" ||
      !parsed.companyId
    ) {
      return null;
    }
    return {
      token: parsed.token,
      userId: parsed.userId,
      companyId: parsed.companyId,
    };
  } catch {
    return null;
  }
}

export function samePushRegistration(
  stored: string | null,
  next: ScopedPushRegistration
): boolean {
  const parsed = parseScopedPushRegistration(stored);
  if (!parsed) return false;
  return (
    parsed.token === next.token &&
    parsed.userId === next.userId &&
    parsed.companyId === next.companyId
  );
}

/**
 * Android device tokens are FCM (`type: "android"`).
 * This remote hook also returns an iOS device token (`type: "ios"`), which is APNs,
 * and the caller posts that value to DeviceTokens/add_token.
 * The preserved company implementation forbids sending APNs to the existing FCM-only endpoint.
 * This function is the remote behavior. It is not the company guard, and the iOS branch
 * must not be copied over that guard.
 */
export function deviceTokenForPlatform(
  platform: string,
  device: { type?: string; data?: unknown } | null | undefined
): string | null {
  if (!device || typeof device.data !== "string" || !device.data) return null;
  if (platform === "android" && device.type === "android") return device.data;
  if (platform === "ios" && device.type === "ios") return device.data;
  return null;
}
