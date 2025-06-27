import AuthWrapper from "@/components/wrapper/auth-wrapper";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <AuthWrapper mode="protected">
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="find-ride" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen
        name="confirm-ride"
        options={{
          headerShown: false,
        }}
      /> */}
        {/* <Stack.Screen
        name="book-ride"
        options={{
          headerShown: false,
        }}
      /> */}
      </Stack>
    </AuthWrapper>
  );
};
export default Layout;
