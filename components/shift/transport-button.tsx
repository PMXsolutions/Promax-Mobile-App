import React, { useRef, useEffect } from "react";
import { StyleSheet, PanResponder, Animated, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import { router } from "expo-router";

const TransportButton = ({ shiftId }: { shiftId: number }) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    // Set initial position to bottom right
    pan.setValue({ x: 0, y: 0 });
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.button,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
    >
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(root)/transport/select-location",
            params: { id: shiftId },
          })
        }
      >
        <MaterialCommunityIcons name="steering" size={35} color="white" />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 150,
    right: 10,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: THEME.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default TransportButton;
