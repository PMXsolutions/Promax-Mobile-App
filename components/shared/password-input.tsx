import React, { ReactNode, useState } from "react";
import {
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import Icon from "@expo/vector-icons/Feather";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Text from "./text";

import { THEME } from "@/constants/theme";
import normalize from "@/libs/normalize";
import { fontFamilyForStartup } from "@/libs/startup-fonts";

export interface PasswordInputProps {
  /**
   * Placeholder text for the password input.
   * @default 'Enter password'
   */
  placeholder?: string;
  /**
   * Current value of the password input.
   */
  value?: string;
  /**
   * Callback function to handle changes to the text input.
   */
  onChangeText?: (text: string) => void;
  /**
   * Icon to display on the left side of the input.
   */
  icon?: ReactNode;
  /**
   * Custom style for the outer container.
   */
  style?: ViewStyle;
  /**
   * Custom style for the container wrapping the input.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom style for the input field.
   */
  inputStyle?: TextStyle;
  /**
   * Color of the border when the input is focused.
   * @default THEME.colors.primary
   */
  focusColor?: string;
  /**
   * Color of the border when the input is not focused.
   * @default THEME.colors.border
   */
  unfocusedColor?: string;
  /**
   * Label text to display above the input.
   */
  label?: string;
  onFocus?: () => void;
  /** Callback function called when the input loses focus */
  onBlur?: () => void;
  accessibilityLabel?: string;
  textContentType?: NativeTextInputProps["textContentType"];
  autoComplete?: NativeTextInputProps["autoComplete"];
  returnKeyType?: NativeTextInputProps["returnKeyType"];
  onSubmitEditing?: NativeTextInputProps["onSubmitEditing"];
  testID?: string;
}

/**
 * Custom Password input component with visibility toggle.
 *
 * @component
 * @example
 * ```tsx
 * <PasswordInput
 *   placeholder="Enter password"
 *   value={password}
 *   onChangeText={setPassword}
 *   focusColor="blue"
 *   unfocusedColor="grey"
 *   label="Password"
 * />
 * ```
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
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
  accessibilityLabel,
  textContentType,
  autoComplete,
  returnKeyType,
  onSubmitEditing,
  testID,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusProgress = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [unfocusedColor, focusColor]
    ),
  }));

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 200 });
    onFocus?.();
  };

  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 200 });
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
        <View style={[styles.outerContainer, style]}>
          {label && (
            <Text style={styles.inputLabel} weight="semiBold">
              {label}
            </Text>
          )}
          <Animated.View
            style={[styles.container, containerStyle, animatedContainerStyle]}
          >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <NativeTextInput
              testID={testID}
              style={[
                styles.input,
                { fontFamily: fontFamilyForStartup(THEME.fontFamily.medium) },
                inputStyle,
              ]}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholderTextColor={THEME.colors.grayBg}
              secureTextEntry={!isPasswordVisible}
              accessibilityLabel={accessibilityLabel ?? label}
              textContentType={textContentType}
              autoComplete={autoComplete}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              accessibilityRole="button"
              accessibilityLabel={
                isPasswordVisible ? "Hide password" : "Show password"
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isPasswordVisible ? (
                <Icon name="eye" size={20} color={THEME.colors.dark} />
              ) : (
                <Icon name="eye-off" size={20} color={THEME.colors.dark} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    height: 48,
  },
  iconContainer: {
    marginRight: normalize(4),
  },
  input: {
    flex: 1,
    fontSize: THEME.fontSize.md,
    color: "#000",
    minHeight: 44,
  },
  inputLabel: {
    fontSize: THEME.fontSize.md,
    marginBottom: 5,
    color: THEME.colors.grayBg,
  },
});

export default PasswordInput;
