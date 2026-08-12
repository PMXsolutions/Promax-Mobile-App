import React, { useEffect } from "react";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
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
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NetworkProvider } from "@/context/NetworkProvider";
import NoConnectionOverlay from "@/components/no-connection";
import useAuthStore from "@/store/use-auth-store";
import usePushNotifications from "@/hooks/usePushNotification";
// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, user } = useAuthStore();
  usePushNotifications(
    isAuthenticated ? user?.userId ?? "" : "",
    isAuthenticated ? user?.companyId ?? 0 : 0
  );

  const [fontLoaded] = useFonts({
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
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded]);

  if (!fontLoaded) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading..."
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={"dark-content"} />
      <NetworkProvider>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <Slot />
              <NoConnectionOverlay />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </NetworkProvider>
      <FlashMessage
        position={Platform.OS === "ios" ? "top" : "bottom"}
        floating
      />
      <PortalHost />
    </View>
  );
}
