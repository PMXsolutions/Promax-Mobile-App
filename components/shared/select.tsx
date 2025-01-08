import * as SelectPrimitive from "@rn-primitives/select";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Icon from "@expo/vector-icons/Feather";
import Animated, { FadeIn, FadeOutDown } from "react-native-reanimated";
import normalize from "@/libs/normalize";
import { THEME } from "@/constants/theme";
import Text from "./text";
import { useTheme } from "@react-navigation/native";

/**
 * Represents an option in the select component.
 */
export type Option = {
  label: string;
  value: string;
};

/**
 * Props for the Select component.
 */
export interface SelectProps {
  /** Array of options to display in the select */
  options: Option[];
  /** Placeholder text to display when no option is selected */
  placeholder?: string;
  /** Callback function called when an option is selected */
  onValueChange?: (value: SelectPrimitive.Option) => void;
  /** Callback function called when the select is opened or closed */
  onOpenChange?: (isOpen: boolean) => void;
  /** Style to apply to the container View */
  containerStyle?: StyleProp<ViewStyle>;
  /** Width of the select component dropdown */
  width?: number;
  /** Color of the chevron icon */
  iconColor?: string;
  value?: string;
}

const WIDTH = Dimensions.get("window").width - 48;

/**
 * A customizable select component for React Native.
 *
 * @component
 * @example
 * import Select from './Select';
 *
 * const MyComponent = () => {
 *   const options = [
 *     { label: 'Option 1', value: 'option1' },
 *     { label: 'Option 2', value: 'option2' },
 *   ];
 *
 *   return (
 *     <Select
 *       options={options}
 *       placeholder="Select an option"
 *       onValueChange={(value) => console.log('Selected:', value)}
 *       onOpenChange={(isOpen) => console.log('Select is open:', isOpen)}
 *       width={300}
 *       iconColor="#007AFF"
 *     />
 *   );
 * };
 */
const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onValueChange,
  containerStyle,
  onOpenChange,
  width = WIDTH,
  iconColor = THEME.colors.primary,
  value,
}) => {
  /**
   * Handles the open state change of the select.
   * @param {boolean} isOpen - Whether the select is open or closed
   */
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
  };

  /**
   * Handles the value change when an option is selected.
   * @param {SelectPrimitive.Option} value - The selected option
   */
  const handleValueChange = (selectedValue: SelectPrimitive.Option) => {
    onValueChange?.(selectedValue);
  };

  // Find the label for the current value
  const selectedLabel =
    options.find((option) => option.value === value)?.label || placeholder;
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <SelectPrimitive.Root
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
      >
        <SelectPrimitive.Trigger style={styles.trigger}>
          <SelectPrimitive.Value
            placeholder={selectedLabel}
            style={{
              fontFamily: THEME.fontFamily.regular,
              color: colors.text,
            }}
          />

          <Icon
            name="chevron-down"
            style={{ marginLeft: "auto" }}
            color={colors.text}
            size={18}
          />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Overlay style={styles.overlay}>
            <SelectPrimitive.Content
              align="center"
              style={{ width, maxHeight: 200 }}
            >
              <Animated.ScrollView
                entering={FadeIn.duration(200)}
                exiting={FadeOutDown.duration(200)}
                style={styles.content}
              >
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    style={styles.item}
                  >
                    <View style={styles.itemInner}>
                      <SelectPrimitive.ItemIndicator
                        style={styles.itemIndicator}
                      >
                        <Text>✓</Text>
                      </SelectPrimitive.ItemIndicator>
                      <Text>{option.label}</Text>
                    </View>
                  </SelectPrimitive.Item>
                ))}
              </Animated.ScrollView>
            </SelectPrimitive.Content>
          </SelectPrimitive.Overlay>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1,
    width: "100%",
  },
  trigger: {
    paddingHorizontal: 10,
    height: normalize(38),
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: normalize(6),
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  content: {
    backgroundColor: THEME.colors.white,
    width: "100%",
    borderRadius: normalize(6),
    borderWidth: 0.5,
    borderColor: THEME.colors.border,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  item: {
    paddingHorizontal: 10,
    height: normalize(38),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    fontFamily: THEME.fontFamily.regular,
  },
  itemInner: {
    flexDirection: "row",
    columnGap: 10,
    paddingLeft: 18,
  },
  itemIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  selectedIndicator: {
    marginLeft: 8,
    color: "blue",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});

export default Select;
