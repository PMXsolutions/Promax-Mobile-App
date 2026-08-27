import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic";
import { BlurView } from "expo-blur";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // tabBarButton: HapticTab,
        // tabBarBackground: TabBarBackground,

        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={50}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarStyle: {
          backgroundColor: "#ffffff",
          paddingTop: 5,
          paddingBottom: -insets.bottom, // Add safe area padding
          height: Platform.OS === "android" ? 65 : 80, // Adjust height for iOS
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarActiveTintColor: THEME.colors.brand,
        // tabBarInactiveTintColor: "#A1A1A1",
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
          tabBarButton: HapticTab,
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
          tabBarButton: HapticTab,
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
                backgroundColor: THEME.colors.brand,
                width: 56,
                height: 56,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: "#fff",

                marginTop: -10, // Ensure central alignment on iOS
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <FontAwesome6 name={"calendar-plus"} size={25} color={"white"} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: "Documents",
          tabBarButton: HapticTab,
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
          tabBarButton: HapticTab,
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
