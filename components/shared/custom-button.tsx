import { ButtonProps } from "@/types/type";
import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import Text from "./text";
import { THEME } from "@/constants/theme";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]): ViewStyle => {
  switch (variant) {
    case "secondary":
      return styles.bgSecondary;
    case "danger":
      return styles.bgDanger;
    case "success":
      return styles.bgSuccess;
    case "outline":
      return styles.bgOutline;
    case "light":
      return styles.bgLight;
    default:
      return styles.bgPrimary;
  }
};

const getTextVariantStyle = (
  variant: ButtonProps["textVariant"]
): TextStyle => {
  switch (variant) {
    case "primary":
      return styles.textPrimary;
    case "secondary":
      return styles.textSecondary;
    case "danger":
      return styles.textDanger;
    case "success":
      return styles.textSuccess;
    default:
      return styles.textDefault;
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  loading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      {...props}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : props.activeOpacity}
      style={[
        styles.buttonBase,
        getBgVariantStyle(bgVariant),
        style,
        isDisabled && styles.disabled,
      ]}
    >
      {IconLeft && <IconLeft />}

      {loading ? (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
          <ActivityIndicator
            color={
              bgVariant === "primary"
                ? THEME.colors.white
                : THEME.colors.primary
            }
          />
        </Animated.View>
      ) : (
        <Text
          style={getTextVariantStyle(textVariant)}
          size="base"
          weight="bold"
        >
          {title}
        </Text>
      )}

      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonBase: {
    // width: "100%",
    height: 48,
    borderRadius: 5,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A0A0A0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  bgPrimary: {
    backgroundColor: THEME.colors.primary,
  },
  bgSecondary: {
    backgroundColor: "#6B7280", // gray-500
  },
  bgDanger: {
    backgroundColor: "#EF4444", // red-500
  },
  bgSuccess: {
    backgroundColor: "#10B981", // green-500
  },
  bgLight: {
    backgroundColor: THEME.colors.light, // green-500
  },
  bgOutline: {
    // backgroundColor: "transparent",
    borderColor: THEME.colors.primary, // neutral-300
    borderWidth: 0.5,
    backgroundColor: THEME.colors.white,
  },
  disabled: {
    opacity: 0.6,
  },

  textDefault: {
    color: "#FFFFFF",
  },
  textPrimary: {
    color: "#000000",
  },
  textSecondary: {
    color: "#F3F4F6", // gray-100
  },
  textDanger: {
    color: "#FEE2E2", // red-100
  },
  textSuccess: {
    color: "#D1FAE5", // green-100
  },
});
