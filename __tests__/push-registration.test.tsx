import React from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import axiosInstance from "@/libs/axiosInstance";
import usePushNotifications from "@/hooks/usePushNotification";
import {
  PUSH_TOKEN_STORAGE_KEY,
  deviceTokenForPlatform,
  fcmTokenForAndroid,
  parseScopedPushRegistration,
} from "@/libs/push-registration";

function loadRenderer(): typeof import("react-test-renderer") {
  const nested = "jest-expo/node_modules/react-test-renderer";
  try {
    const version = require(`${nested}/package.json`).version as string;
    if (version.startsWith("19.")) return require(nested);
  } catch {
    // A flat install exposes the matching renderer at the package name.
  }
  return require("react-test-renderer");
}

const TestRenderer = loadRenderer();
const { act } = TestRenderer;

const post = axiosInstance.post as jest.Mock;
const getDeviceToken = Notifications.getDevicePushTokenAsync as jest.Mock;
const setChannel = Notifications.setNotificationChannelAsync as jest.Mock;
const getChannels = Notifications.getNotificationChannelsAsync as jest.Mock;

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: "ExponentPushToken[test]" })),
  getDevicePushTokenAsync: jest.fn(async () => ({
    type: "android",
    data: "device-token",
  })),
  getNotificationChannelsAsync: jest.fn(async () => []),
  setNotificationChannelAsync: jest.fn(async () => ({})),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock("expo-device", () => ({ isDevice: true }));

jest.mock("expo-constants", () => ({
  expoConfig: { extra: { eas: { projectId: "project-1" } } },
  easConfig: { projectId: "project-1" },
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("@/libs/axiosInstance", () => ({
  __esModule: true,
  default: { post: jest.fn(async () => ({ data: {} })) },
}));

jest.mock("@react-native-async-storage/async-storage", () => {
  const memory = new Map<string, string>();
  return {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: async (key: string) => {
      memory.delete(key);
    },
    __memory: memory,
  };
});

function Harness({
  userId,
  companyId,
}: {
  userId?: string | number | null;
  companyId?: string | number | null;
}) {
  usePushNotifications(userId, companyId);
  return null;
}

async function flush() {
  await act(async () => {
    for (let step = 0; step < 30; step += 1) await Promise.resolve();
  });
}

function renderSession(
  userId: string | number | null,
  companyId: string | number | null
) {
  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(
      <Harness userId={userId} companyId={companyId} />
    );
  });
  return renderer!;
}

describe("scoped push registration", () => {
  const originalOs = Platform.OS;

  beforeEach(async () => {
    post.mockReset();
    post.mockResolvedValue({ data: {} });
    getDeviceToken.mockReset();
    getDeviceToken.mockResolvedValue({ type: "android", data: "device-token" });
    setChannel.mockClear();
    getChannels.mockClear();
    (Platform as { OS: string }).OS = "android";
    const memory = (
      AsyncStorage as unknown as { __memory: Map<string, string> }
    ).__memory;
    memory.clear();
  });

  afterEach(() => {
    (Platform as { OS: string }).OS = originalOs;
  });

  it("registers again when the same device token is used by another company", async () => {
    const renderer = renderSession("user-1", 9);
    await flush();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/DeviceTokens/add_token", {
      Device_Token: "device-token",
      UserId: "user-1",
      CompanyId: 9,
    });
    expect(setChannel).toHaveBeenCalled();

    await act(async () => {
      renderer.update(<Harness userId="user-1" companyId={8} />);
    });
    await flush();
    expect(post).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenLastCalledWith("/DeviceTokens/add_token", {
      Device_Token: "device-token",
      UserId: "user-1",
      CompanyId: 8,
    });
    expect(parseScopedPushRegistration(await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY))).toEqual({
      token: "device-token",
      userId: "user-1",
      companyId: "8",
    });
    await act(async () => {
      renderer.unmount();
    });
  });

  it("registers again after an account switch and does not skip a legacy global token", async () => {
    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, "device-token");
    const renderer = renderSession("user-2", 4);
    await flush();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/DeviceTokens/add_token", {
      Device_Token: "device-token",
      UserId: "user-2",
      CompanyId: 4,
    });

    await act(async () => {
      renderer.update(<Harness userId="user-3" companyId={4} />);
    });
    await flush();
    expect(post).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenLastCalledWith("/DeviceTokens/add_token", {
      Device_Token: "device-token",
      UserId: "user-3",
      CompanyId: 4,
    });
    await act(async () => {
      renderer.unmount();
    });
  });

  it("retries a failed registration and then skips the same user and company", async () => {
    post.mockRejectedValueOnce(new Error("offline"));
    const first = renderSession("user-1", 9);
    await flush();
    expect(post).toHaveBeenCalledTimes(1);
    expect(await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY)).toBeNull();
    await act(async () => {
      first.unmount();
    });

    post.mockResolvedValue({ data: {} });
    const second = renderSession("user-1", 9);
    await flush();
    expect(post).toHaveBeenCalledTimes(2);
    await act(async () => {
      second.unmount();
    });

    const third = renderSession("user-1", 9);
    await flush();
    expect(post).toHaveBeenCalledTimes(2);
    await act(async () => {
      third.unmount();
    });
  });

  it("does not register a token that finishes after logout", async () => {
    let releaseToken: (value: { type: string; data: string }) => void = () => {};
    getDeviceToken.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseToken = resolve;
        })
    );
    const renderer = renderSession("user-1", 9);
    await flush();
    expect(post).not.toHaveBeenCalled();

    await act(async () => {
      renderer.update(<Harness userId="" companyId={0} />);
    });
    releaseToken({ type: "android", data: "device-token" });
    await flush();
    expect(post).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY)).toBeNull();
    await act(async () => {
      renderer.unmount();
    });
  });

  it("does not keep a registration whose request finishes after logout", async () => {
    let releasePost: () => void = () => {};
    post.mockImplementation(
      () =>
        new Promise((resolve) => {
          releasePost = () => resolve({ data: {} });
        })
    );
    const renderer = renderSession("user-1", 9);
    await flush();
    expect(post).toHaveBeenCalledTimes(1);

    await act(async () => {
      renderer.update(<Harness userId="" companyId={0} />);
    });
    releasePost();
    await flush();
    expect(await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY)).toBeNull();

    getDeviceToken.mockResolvedValue({ type: "android", data: "device-token" });
    post.mockResolvedValue({ data: {} });
    await act(async () => {
      renderer.update(<Harness userId="user-9" companyId={3} />);
    });
    await flush();
    expect(post).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenLastCalledWith("/DeviceTokens/add_token", {
      Device_Token: "device-token",
      UserId: "user-9",
      CompanyId: 3,
    });
    await act(async () => {
      renderer.unmount();
    });
  });

  it("keeps Android FCM and iOS APNs on their own platforms", async () => {
    // Remote behavior only. The company tree forbids an APNs post to the FCM-only endpoint.
    // This expectation must not be copied over that guard.
    expect(deviceTokenForPlatform("android", { type: "android", data: "fcm" })).toBe(
      "fcm"
    );
    expect(deviceTokenForPlatform("android", { type: "ios", data: "apns" })).toBeNull();
    expect(deviceTokenForPlatform("ios", { type: "ios", data: "apns" })).toBe("apns");
    expect(deviceTokenForPlatform("ios", { type: "android", data: "fcm" })).toBeNull();
    expect(fcmTokenForAndroid("android", { type: "android", data: "fcm" })).toBe("fcm");
    expect(fcmTokenForAndroid("android", { type: "ios", data: "apns" })).toBeNull();
    expect(fcmTokenForAndroid("ios", { type: "ios", data: "apns" })).toBeNull();
    expect(fcmTokenForAndroid("ios", { type: "android", data: "fcm" })).toBeNull();

    (Platform as { OS: string }).OS = "ios";
    getDeviceToken.mockResolvedValue({ type: "ios", data: "apns-token" });
    const ios = renderSession("user-1", 9);
    await flush();
    expect(post).toHaveBeenCalledWith("/DeviceTokens/add_token", {
      Device_Token: "apns-token",
      UserId: "user-1",
      CompanyId: 9,
    });
    expect(setChannel).not.toHaveBeenCalled();
    expect(getChannels).not.toHaveBeenCalled();
    await act(async () => {
      ios.unmount();
    });

    post.mockClear();
    getDeviceToken.mockResolvedValue({ type: "android", data: "fcm-on-ios" });
    const mismatched = renderSession("user-1", 9);
    await flush();
    expect(post).not.toHaveBeenCalled();
    expect(setChannel).not.toHaveBeenCalled();
    await act(async () => {
      mismatched.unmount();
    });
  });
});
