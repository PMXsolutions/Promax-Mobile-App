import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import axiosInstance from "@/libs/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { pathForNotificationData } from "@/libs/notification-route";
import {
  PUSH_TOKEN_STORAGE_KEY,
  ScopedPushRegistration,
  deviceTokenForPlatform,
  samePushRegistration,
  scopePushIdentity,
} from "@/libs/push-registration";

export interface NotificationData {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const usePushNotifications = (
  userId?: number | string | null,
  companyId?: number | string | null
) => {
  const shouldSkip =
    userId == null ||
    userId === "" ||
    companyId == null ||
    Number(companyId) === 0;
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const [loading, setLoading] = useState(false);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    let active = true;
    const stillCurrent = () => active;
    if (shouldSkip) {
      return () => {
        active = false;
      };
    }
    const scope = scopePushIdentity(userId as number | string, companyId as number | string);

    const setupPushNotifications = async () => {
      setLoading(true);
      const expoToken = await registerForPushNotificationsAsync();
      if (!stillCurrent()) return;
      if (expoToken) {
        setExpoPushToken(expoToken);
      }

      const deviceToken = await readPlatformDeviceToken();
      if (!stillCurrent()) return;
      if (deviceToken) {
        setFcmToken(deviceToken);
        const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
        if (!stillCurrent()) return;
        const registration = { ...scope, token: deviceToken };
        if (!samePushRegistration(storedToken, registration)) {
          const saved = await postDeviceToken(registration);
          if (!stillCurrent()) return;
          if (saved) await rememberPushRegistration(registration, stillCurrent);
          if (!stillCurrent()) return;
        }
      }

      if (Platform.OS === "android") {
        const androidChannels =
          await Notifications.getNotificationChannelsAsync();
        if (!stillCurrent()) return;
        setChannels(androidChannels ?? []);
      }

      notificationListener.current =
        Notifications.addNotificationReceivedListener(
          (notification: Notifications.Notification) => {
            setNotification(notification);
          }
        );

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          (response: Notifications.NotificationResponse) => {
            const data = response.notification.request.content.data as
              | Record<string, unknown>
              | undefined;
            router.push(pathForNotificationData(data) as never);
          }
        );

      if (stillCurrent()) setLoading(false);
    };

    setupPushNotifications();

    return () => {
      active = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [shouldSkip, userId, companyId]);

  const schedulePushNotification = async (
    notificationData: NotificationData
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title || "Notification",
        body: notificationData.body || "Here is your notification!",
        data: { data: notificationData.data || {} },
      },
      trigger: null,
    });
  };

  return {
    expoPushToken,
    fcmToken,
    channels,
    notification,
    setNotification,
    schedulePushNotification,
    loading,
  };
};

// Register for push notifications
async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token: string | undefined;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      console.error("Error getting expo push token", e);
    }
  }

  return token;
}

let registrationQueue: Promise<void> = Promise.resolve();

async function postDeviceToken(
  registration: ScopedPushRegistration
): Promise<boolean> {
  try {
    await axiosInstance.post("/DeviceTokens/add_token", {
      Device_Token: registration.token,
      UserId: registration.userId,
      CompanyId: Number(registration.companyId),
    });
    return true;
  } catch (error) {
    console.error("Error sending token to PromaxCare API:", error);
    return false;
  }
}

async function rememberPushRegistration(
  registration: ScopedPushRegistration,
  stillCurrent: () => boolean
): Promise<void> {
  const payload = JSON.stringify(registration);
  const run = registrationQueue.then(async () => {
    if (!stillCurrent()) return;
    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, payload);
    if (!stillCurrent()) {
      const latest = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (latest === payload) {
        await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      }
    }
  });
  registrationQueue = run.then(
    () => undefined,
    () => undefined
  );
  await run;
}

/** Android returns the FCM token. iOS returns the APNs token. The other type is ignored. */
async function readPlatformDeviceToken(): Promise<string | null> {
  try {
    const device = await Notifications.getDevicePushTokenAsync();
    return deviceTokenForPlatform(Platform.OS, device);
  } catch (error) {
    console.error("Failed to get device push token", error);
    return null;
  }
}

export default usePushNotifications;
