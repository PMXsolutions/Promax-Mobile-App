import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNetwork } from "@/context/NetworkProvider";
import { THEME } from "@/constants/theme";

const { width } = Dimensions.get("window");

const NoConnectionToast = () => {
  const { isConnected } = useNetwork();
  const slideY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!isConnected) {
      Animated.spring(slideY, {
        toValue: Platform.OS === "ios" ? 60 : 40,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 4 seconds
      setTimeout(() => {
        Animated.timing(slideY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 4000);
    }
  }, [isConnected]);

  if (isConnected) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideY }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.toastText}>No internet connection</Text>
      </View>
    </Animated.View>
  );
};

export default NoConnectionToast;

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  toastContent: {
    backgroundColor: THEME?.colors?.error || "#d9534f",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
