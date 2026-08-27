import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNetwork } from "@/context/NetworkProvider";
import { THEME } from "@/constants/theme";

const { width } = Dimensions.get("window");

const NoConnectionToast = () => {
  const { isConnected } = useNetwork();
  const slideY = useRef(new Animated.Value(-100)).current;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isConnected === false && !dismissed) {
      Animated.spring(slideY, {
        toValue: Platform.OS === "ios" ? 60 : 40,
        useNativeDriver: true,
      }).start();
    }

    // If connection is restored, slide out
    if (isConnected === true) {
      Animated.timing(slideY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setDismissed(false); // reset for future disconnections
      });
    }
  }, [dismissed, isConnected, slideY]);

  if (isConnected !== false || dismissed) return null;

  const handleDismiss = () => {
    Animated.timing(slideY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
    });
  };

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
        <Pressable onPress={handleDismiss} style={styles.dismissBtn}>
          <MaterialIcons name="close" size={18} color="#fff" />
        </Pressable>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
    maxWidth: "95%",
  },
  toastText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    flexShrink: 1,
  },
  dismissBtn: {
    marginLeft: 12,
    padding: 4,
  },
});
