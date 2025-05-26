import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "@/constants/theme"; // Optional: your color palette
import { useNetwork } from "@/context/NetworkProvider";

const { height } = Dimensions.get("window");

const NoConnectionOverlay = () => {
  const { isConnected } = useNetwork();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    if (!isConnected) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -height,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isConnected]);

  if (isConnected) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.card}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={64}
          color={THEME?.colors?.grayBg || "#888"}
          style={{ marginBottom: 20 }}
        />
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.message}>
          You're offline. Please check your connection and try again.
        </Text>
      </View>
    </Animated.View>
  );
};

export default NoConnectionOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  card: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },
});
