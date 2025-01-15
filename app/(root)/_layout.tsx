import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animation: "slide_from_right",
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
  );
};

export default Layout;
