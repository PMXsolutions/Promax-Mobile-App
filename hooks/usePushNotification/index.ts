import { useState, useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/libs/axiosInstance";

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

  // Register device token on tenant-bound BE DeviceTokens (not external Render host).
  const sendTokenToBackend = async (deviceToken: string) => {
    try {
      await axiosInstance.post("/DeviceTokens/add_token", {
        Device_Token: deviceToken,
        UserId: userId,
        CompanyId: companyId,
      });
      await AsyncStorage.setItem("fcmToken", deviceToken);
    } catch (error) {
      console.error("Failed to register device token with API");
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
        // Do not log device push tokens (secret/PII adjacent).
        setFcmToken(fcmDeviceToken);
        const storedToken = await AsyncStorage.getItem("fcmToken");
        if (storedToken !== fcmDeviceToken) {
          await sendTokenToBackend(fcmDeviceToken);
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
        Notifications.addNotificationResponseReceivedListener(() => {
          // Intentionally no token/payload logging.
        });

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
    } catch (e) {
      console.error("Error getting expo push token");
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
    console.error("Failed to get FCM token");
    return null;
  }
}

export default usePushNotifications;
