// ScreenWrapper.tsx

import React from "react";
import { StatusBar, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WrapperProps {
  children: React.ReactNode;
  statusBgColor?: string;
  barStyle?: "default" | "light-content" | "dark-content";
  bgColor?: string; // default background color is white (optional)
}
const ScreenWrapper = ({
  children,
  statusBgColor = "#fff",
  barStyle = "default",
  bgColor = "#fff",
}: WrapperProps) => {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar
        backgroundColor={statusBgColor}
        barStyle={barStyle}
        translucent
      />
      <SafeAreaView
        // edges={["top", "bottom"]}
        style={{
          flex: 1,
          paddingTop: insets.top,
          backgroundColor: bgColor,
        }}
      >
        {children}
      </SafeAreaView>
    </>
  );
};

export default ScreenWrapper;
