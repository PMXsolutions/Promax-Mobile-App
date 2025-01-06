import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
