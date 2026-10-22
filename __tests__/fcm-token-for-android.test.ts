import { fcmTokenForAndroid } from "@/libs/push-registration";

/**
 * Portable company check. It does not render the remote hook and it does not
 * post a token. The company Android-only guard can import `fcmTokenForAndroid`.
 * `deviceTokenForPlatform` is not this test: that function still returns an
 * Apple token for the public remote hook.
 */
describe("fcmTokenForAndroid", () => {
  it("returns an FCM token only for Android", () => {
    expect(fcmTokenForAndroid("android", { type: "android", data: "fcm-token" })).toBe(
      "fcm-token"
    );
  });

  it("returns null for an Apple token on either platform", () => {
    expect(fcmTokenForAndroid("ios", { type: "ios", data: "apns-token" })).toBeNull();
    expect(fcmTokenForAndroid("android", { type: "ios", data: "apns-token" })).toBeNull();
    expect(fcmTokenForAndroid("ios", { type: "android", data: "fcm-token" })).toBeNull();
    expect(fcmTokenForAndroid("android", { type: "android", data: "" })).toBeNull();
    expect(fcmTokenForAndroid("android", null)).toBeNull();
  });
});