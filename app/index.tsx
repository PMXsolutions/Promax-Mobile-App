import React, { useEffect } from "react";
import { router } from "expo-router";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import storageUtil from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import useAuthStore from "@/store/use-auth-store";

const Index = () => {
  const { hasHydrated, user } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    const checkOnboarding = async () => {
      const hasOnboarded = await storageUtil.getItem(STORAGE_KEYS.ONBOARDED);

      if (user) {
        router.replace("/(root)/(tabs)");
      } else if (hasOnboarded) {
        router.replace("/(auth)/sign-in");
      } else {
        router.replace("/(auth)/welcome");
      }
    };

    checkOnboarding();
  }, [hasHydrated, user]);

  // Optional loading UI
  return (
    <Loader name="2-curves" color={THEME.colors.secondary} title="Loading..." />
  );
};

export default Index;
