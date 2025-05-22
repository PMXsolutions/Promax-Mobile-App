import React, { useEffect, useState } from "react";
import { Slot, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DancingScript_400Regular } from "@expo-google-fonts/dancing-script";
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { PortalHost } from "@rn-primitives/portal";
import FlashMessage from "react-native-flash-message";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/libs/query";
import { Platform, StatusBar, View } from "react-native";
import "react-native-get-random-values";
import useAuthStore from "@/store/use-auth-store";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import usePushNotifications from "@/hooks/usePushNotification";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(root)/(tabs)",
};

export default function RootLayout() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<
    boolean | null
  >(null);

  const { isAuthenticated, user } = useAuthStore();
  // const pushToken = usePushNotifications(
  //   user?.userId ?? "",
  //   user?.companyId ?? 0
  // );

  const [fontLoaded, fontLoadError] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    DancingScript_400Regular,
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const status = await AsyncStorage.getItem("onboardingComplete");
      setIsOnboardingComplete(status === "true");
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (fontLoaded && isOnboardingComplete !== null) {
      SplashScreen.hideAsync();

      if (!isOnboardingComplete) {
        router.replace("/(auth)/welcome");
      } else if (isAuthenticated) {
        router.replace("/");
      } else {
        router.replace("/(auth)/sign-in");
      }
    }
  }, [fontLoaded, isOnboardingComplete, isAuthenticated]);

  if (!fontLoaded || isOnboardingComplete === null) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading.."
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={"dark-content"} />
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <Slot />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
      <FlashMessage
        position={Platform.OS === "ios" ? "top" : "bottom"}
        floating={true}
      />
      <PortalHost />
    </View>
  );
}
