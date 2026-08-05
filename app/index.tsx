import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import storageUtil from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import useAuthStore, { isAuthSessionExpired } from "@/store/use-auth-store";

const Index = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(
    useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const checkOnboarding = async () => {
      const hasOnboarded = await storageUtil.getItem(STORAGE_KEYS.ONBOARDED);
      const hasValidSession =
        isAuthenticated &&
        !!user &&
        !!token &&
        user.role === "Staff" &&
        !isAuthSessionExpired(user, token);

      if (hasValidSession) {
        router.replace("/(root)/(tabs)");
        return;
      }

      if (hasOnboarded) {
        router.replace("/(auth)/sign-in");
      } else {
        router.replace("/(auth)/welcome");
      }
    };

    checkOnboarding();
  }, [hasHydrated, isAuthenticated, token, user]);

  // Optional loading UI
  return (
    <Loader name="2-curves" color={THEME.colors.secondary} title="Loading..." />
  );
};

export default Index;
