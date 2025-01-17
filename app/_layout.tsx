import React, { useEffect, useState } from "react";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { StatusBar } from "react-native";
import "react-native-get-random-values";
import useAuthStore from "@/store/use-auth-store";
import MiniLoader from "@/components/shared/mini-loader";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(root)/(tabs)",
};

export default function RootLayout() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<
    boolean | null
  >(null);

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
  });

  // Check if onboarding is complete
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const status = await AsyncStorage.getItem("onboardingComplete");
      setIsOnboardingComplete(status === "true");
    };

    checkOnboardingStatus();
  }, []);

  // Hide SplashScreen once fonts and onboarding status are loaded
  useEffect(() => {
    if (fontLoaded && isOnboardingComplete !== null) {
      SplashScreen.hideAsync();

      // Navigate to the onboarding screen if it's not complete
      if (!isOnboardingComplete) {
        router.replace("/(auth)/welcome"); // Ensure you have a file named `onboarding.tsx` in your `pages` folder
      }
    }
  }, [fontLoaded, isOnboardingComplete, fontLoadError]);

  // Show a loading state until fonts and onboarding status are resolved
  if (!fontLoaded || isOnboardingComplete === null) {
    return <MiniLoader visible={true} />;
  }
  return <Root />;
}
function Root() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    } else if (!isAuthenticated) {
      router.replace("/(auth)/sign-in");
    }
  }, [isAuthenticated]);
  return (
    <>
      <StatusBar barStyle={"dark-content"} />
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              gestureEnabled: true,
              gestureDirection: "horizontal",
              animation: "slide_from_right",
            }}
          >
            {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </GestureHandlerRootView>
      </QueryClientProvider>
      <FlashMessage position="top" />
      <PortalHost />
    </>
  );
}
