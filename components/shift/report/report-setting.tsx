import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import React from "react";
import { View } from "react-native";
import { StyleSheet, Switch as RNSwitch, SwitchProps } from "react-native";

interface CustomSwitchProps extends SwitchProps {
  label?: JSX.Element; // Optional label for the switch
  containerStyle?: any; // Style for the container
  labelStyle?: any; // Style for the label
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  value,
  onValueChange,
  containerStyle,
  labelStyle,
  ...props
}) => {
  return (
    <View style={styles.sectionBodyCon}>
      <View style={styles.sectionBody}>
        {label}
        {/* <Text size="md" weight="medium">
          {label}
        </Text> */}
        {/* <Text size="sm" weight="regular">
          {item.body}
        </Text> */}
      </View>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: THEME.colors.border, true: THEME.colors.primary }}
        thumbColor={value ? THEME.colors.white : THEME.colors.grayBg}
        {...props}
      />
    </View>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  sectionBodyCon: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.7,
    borderBottomColor: THEME.colors.inactive,
    marginBottom: 5,
  },
  sectionBody: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "75%",
    paddingBottom: 11,
    marginTop: THEME.spacing.md,
    gap: 12,
  },
});
