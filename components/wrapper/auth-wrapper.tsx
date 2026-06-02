// components/auth/AuthWrapper.tsx
import { useEffect } from "react";
import { router } from "expo-router";
import useAuthStore from "@/store/use-auth-store";

interface AuthWrapperProps {
  children: React.ReactNode;
  mode: "auth" | "protected"; // auth: login/signup, protected: app
}

export default function AuthWrapper({ children, mode }: AuthWrapperProps) {
  const { hasHydrated, user } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (mode === "auth" && user) {
      router.replace("/(root)/(tabs)");
    }

    if (mode === "protected" && !user) {
      router.replace("/(auth)/sign-in");
    }
  }, [hasHydrated, mode, user]);

  if (!hasHydrated) return null;

  return <>{children}</>;
}
