import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import storageUtil from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const Index = () => {
  useEffect(() => {
    const checkOnboarding = async () => {
      const hasOnboarded = await storageUtil.getItem(STORAGE_KEYS.ONBOARDED);

      if (hasOnboarded) {
        router.replace("/(auth)/sign-in");
      } else {
        router.replace("/(auth)/welcome");
      }
    };

    checkOnboarding();
  }, []);

  // Optional loading UI
  return (
    <Loader name="2-curves" color={THEME.colors.secondary} title="Loading..." />
  );
};

export default Index;
