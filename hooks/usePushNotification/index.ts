import { useState, useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Setup notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Types
interface NotificationData {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

interface UsePushNotificationsResult {
  expoPushToken: string;
  fcmToken: string;
  channels: Notifications.NotificationChannel[];
  notification: Notifications.Notification | undefined;
  setNotification: (
    notification: Notifications.Notification | undefined
  ) => void;
  schedulePushNotification: (
    notificationData: NotificationData
  ) => Promise<void>;
  loading: boolean;
}

const usePushNotifications = (
  userId: string,
  companyId: number
): UsePushNotificationsResult => {
  const shouldSkip = Platform.OS === "web" || !userId || !companyId;
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [fcmToken, setFcmToken] = useState<string>("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Send token to backend
  const sendTokenToBackend = async (fcmToken: string) => {
    try {
      const response = await fetch(
        "https://push-notification-r5mb.onrender.com/api/save-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_Token: fcmToken,
            userId,
            companyId,
          }),
        }
      );

      if (response.ok) {
        console.log("Token successfully sent to the backend.");
        await AsyncStorage.multiSet([
          ["fcmToken", fcmToken],
          ["fcmTokenOwner", userId],
        ]);
      } else {
        console.error("Failed to send token to backend:", response.status);
      }
    } catch (error) {
      console.error("Error sending token to backend:", error);
    }
  };

  useEffect(() => {
    if (shouldSkip) return;
    const setupPushNotifications = async () => {
      setLoading(true);
      const expoToken = await registerForPushNotificationsAsync();
      if (expoToken) {
        setExpoPushToken(expoToken);
      }

      const fcmDeviceToken = await getFCMDevicePushTokenAsync();
      if (fcmDeviceToken) {
        console.log(fcmDeviceToken);
        setFcmToken(fcmDeviceToken);
        // Recently updated: token registration is scoped to the signed-in user to prevent shared-device bleed.
        const [[, storedToken], [, storedOwner]] = await AsyncStorage.multiGet([
          "fcmToken",
          "fcmTokenOwner",
        ]);
        if (storedToken !== fcmDeviceToken || storedOwner !== userId) {
          await sendTokenToBackend(fcmDeviceToken);
        } else {
          console.log("FCM Token is already sent to backend");
        }
      }

      if (Platform.OS === "android") {
        const androidChannels =
          await Notifications.getNotificationChannelsAsync();
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
            console.log("Notification Response:", response);
          }
        );

      setLoading(false);
    };

    setupPushNotifications();

    return () => {
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
      Alert.alert("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error("Project ID not found");
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.error("Error getting expo push token", e);
    }
  } else {
    Alert.alert("Must use physical device for Push Notifications");
  }

  return token;
}

// Get FCM token
async function getFCMDevicePushTokenAsync(): Promise<string | null> {
  try {
    const fcmToken = (await Notifications.getDevicePushTokenAsync()).data;
    return fcmToken;
  } catch (error) {
    console.error("Failed to get FCM token", error);
    return null;
  }
}

export default usePushNotifications;
