import React, { ReactNode } from "react";
import {
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { THEME } from "@/constants/theme";
import normalize from "@/libs/normalize";
import { useTheme } from "@react-navigation/native";
import Text from "./text";

/**
 * Props for the TextInput component.
 */
export interface TextInputProps extends NativeTextInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  icon?: ReactNode;
  style?: StyleProp<TextStyle>; // FIXED HERE
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  focusColor?: string;
  unfocusedColor?: string;
  label?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  placeholder = "",
  value,
  onChangeText,
  icon,
  style,
  containerStyle,
  inputStyle,
  focusColor = THEME.colors.primary,
  unfocusedColor = THEME.colors.border,
  label,
  onFocus,
  onBlur,
  required = false,
  ...props
}) => {
  const focusProgress = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [unfocusedColor, focusColor]
    );

    return {
      borderColor,
    };
  });

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 300 });
    onFocus?.();
  };

  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 300 });
    onBlur?.();
  };

  const { colors } = useTheme();

  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    // >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.outerContainer, containerStyle]}>
        {label && (
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.inputLabel}>{label} </Text>
            {required && <Text style={{ color: "#f60000" }}>*</Text>}
          </View>
        )}
        <Animated.View
          style={[styles.container, containerStyle, animatedContainerStyle]}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <NativeTextInput
            style={[styles.input, inputStyle, style]} // Ensure styles here use only TextStyle
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={THEME.colors.grayBg}
            {...props}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
    // </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: "auto",
    borderRadius: normalize(6),
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: normalize(7),
    paddingHorizontal: THEME.spacing.sm,
    height: normalize(38),
  },
  iconContainer: {
    marginRight: normalize(4),
  },
  input: {
    flex: 1,
    fontFamily: THEME.fontFamily.medium,
    fontSize: THEME.fontSize.md,
  },
  inputLabel: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fontFamily.semiBold,
    marginBottom: 5,
    color: THEME.colors.grayBg,
  },
});

export default TextInput;
