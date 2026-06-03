// components/auth/AuthWrapper.tsx
import { useEffect, useState } from "react";
import { router } from "expo-router";
import useAuthStore from "@/store/use-auth-store";

interface AuthWrapperProps {
  children: React.ReactNode;
  mode: "auth" | "protected"; // auth: login/signup, protected: app
}

export default function AuthWrapper({ children, mode }: AuthWrapperProps) {
  const { user, token, isAuthenticated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(
    useAuthStore.persist.hasHydrated()
  );

  const hasValidSession =
    hasHydrated &&
    isAuthenticated &&
    !!user &&
    !!token &&
    user.role === "Staff";

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (mode === "auth" && hasValidSession) {
      router.replace("/(root)/(tabs)");
    }

    if (mode === "protected" && !hasValidSession) {
      router.replace("/(auth)/sign-in");
    }
  }, [hasHydrated, hasValidSession, mode]);

  if (!hasHydrated) return null;

  if (mode === "protected" && !hasValidSession) return null;

  if (mode === "auth" && hasValidSession) return null;

  return <>{children}</>;
}
