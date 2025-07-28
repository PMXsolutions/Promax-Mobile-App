import React, { useEffect } from "react";
import { Platform, StatusBar, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WrapperProps {
  children: React.ReactNode;
  statusBgColor?: string;
  barStyle?: "default" | "light-content" | "dark-content";
  bgColor?: string;
}

const ScreenWrapper = ({
  children,
  statusBgColor,
  barStyle = "default",
  bgColor = "#fff",
}: WrapperProps) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    StatusBar.setBarStyle(barStyle, true);

    if (Platform.OS === "android") {
      // 👇 Force backgroundColor to apply after render
      StatusBar.setBackgroundColor(statusBgColor ?? "#fff", true);
      StatusBar.setTranslucent(false); // 👈 key line to make backgroundColor visible
    }
  }, [barStyle, statusBgColor]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: bgColor,
      }}
    >
      <StatusBar backgroundColor={statusBgColor} barStyle={barStyle} />
      {children}
    </SafeAreaView>
  );
};

export default ScreenWrapper;
