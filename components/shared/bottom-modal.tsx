import React from "react";
import { View, StyleSheet, Animated, Pressable } from "react-native";
import Text from "../shared/text";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const BottomModal = ({
  setStatus,
  title = "Bottom Sheet",
  children,
}: {
  title: string;
  setStatus: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}) => {
  const { colors } = useTheme();
  const slide = React.useRef(new Animated.Value(300)).current;

  const slideUp = () => {
    // Will change slide up the bottom sheet
    Animated.timing(slide, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const slideDown = () => {
    // Will slide down the bottom sheet
    Animated.timing(slide, {
      toValue: 300,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    slideUp();
  });

  const closeModal = () => {
    slideDown();

    setTimeout(() => {
      setStatus(false);
    }, 800);
  };

  return (
    <Pressable onPress={closeModal} style={styles.backdrop}>
      <Pressable style={{ width: "100%", height: "40%" }}>
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slide }],
              backgroundColor: colors.background,
            },
          ]}
        >
          {/* <MaterialCommunityIcons
            onPressIn={closeModal}
            name="close"
            size={24}
            color={colors.text}
            style={{ position: "absolute", top: 20, right: 20 }}
          /> */}
          <Text size="3xl" weight="bold">
            {title}
          </Text>
          <View style={{ marginTop: 20 }}>{children}</View>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
};

export default BottomModal;

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    width: "100%",
    height: "100%",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
    position: "relative",
  },
});
