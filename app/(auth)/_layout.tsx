// app/(auth)/_layout.tsx
import AuthWrapper from "@/components/wrapper/auth-wrapper";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <AuthWrapper mode="auth">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="forgot-password" />
        {/* You don't have to list all screens here unless you want to customize them */}
      </Stack>
    </AuthWrapper>
  );
}
