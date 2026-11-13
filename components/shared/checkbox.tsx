import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import { THEME } from "@/constants/theme";
import Text from "./text";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  style?: any;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  style,
}) => {
  return (
    <Pressable
      style={[styles.container, style]}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={8}
    >
      <CheckboxPrimitive.Root
        pointerEvents="none"
        style={[
          styles.checkbox,
          {
            borderWidth: checked ? 0 : 1,
          },
        ]}
        checked={checked}
        onCheckedChange={onChange}
      >
        <CheckboxPrimitive.Indicator style={styles.checked}>
          <Feather name="check" size={10} color={THEME.colors.white} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default Checkbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.xs,
    minHeight: 44,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  checked: {
    height: 17,
    borderRadius: 4,
    aspectRatio: 1,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    marginLeft: 4,
  },
  label: {
    fontSize: 14,
    color: THEME.colors.dark,
  },
});
