import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Loader from "@/components/shared/loader";
import useAuthStore from "@/store/use-auth-store";
import { THEME } from "@/constants/theme";

const Index = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<
    boolean | null
  >(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleRouting = async () => {
      const onboarding = await AsyncStorage.getItem("onboardingComplete");
      const isDone = onboarding === "true";
      setIsOnboardingComplete(isDone);

      if (!isDone) {
        router.replace("/(auth)/welcome");
      } else if (!isAuthenticated) {
        router.replace("/(auth)/sign-in");
      } else {
        router.replace("/(root)/(tabs)"); // or "/" if you're routing to (tabs)
      }
    };

    handleRouting();
  }, [isAuthenticated]);

  if (isOnboardingComplete === null) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading..."
      />
    );
  }

  return <View />; // This will never be shown because router.replace() will redirect
};

export default Index;
