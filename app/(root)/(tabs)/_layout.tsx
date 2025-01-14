import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import {
  Pressable,
  PressableProps,
  AccessibilityState,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomTabButtonProps = PressableProps & {
  accessibilityState?: AccessibilityState;
  children: React.ReactNode;
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const CustomTabButton: React.FC<CustomTabButtonProps> = ({
    children,
    onPress,
    accessibilityState,
  }) => {
    const focused = accessibilityState?.selected ?? false;

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: pressed ? "#f0f0f0" : "transparent",
          },
          focused && {
            borderTopWidth: 2,
            borderTopColor: THEME.colors.primary,
          },
        ]}
      >
        {children}
      </Pressable>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          // paddingHorizontal: 10,
          paddingBottom: -insets.bottom, // Add safe area padding
          height: Platform.OS === "android" ? 65 : 80, // Adjust height for iOS
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: "#A1A1A1",
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: THEME.fontFamily.semiBold,
          marginBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Shift Roster",
          // tabBarButton: (props) => <CustomTabButton {...props} />,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "calendar-text" : "calendar-today"}
              size={25}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          // tabBarButton: (props) => <CustomTabButton {...props} />,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={
                focused ? "file-document-edit" : "file-document-edit-outline"
              }
              size={25}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: THEME.colors.primary,
                width: 56,
                height: 56,
                borderRadius: 999,
                // marginTop: -20, // Ensure central alignment on iOS
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <MaterialCommunityIcons name={"plus"} size={25} color={"white"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: "Documents",
          // tabBarButton: (props) => <CustomTabButton {...props} />,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "folder-open" : "folder-open-outline"}
              size={25}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          // tabBarButton: (props) => <CustomTabButton {...props} />,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              size={25}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
