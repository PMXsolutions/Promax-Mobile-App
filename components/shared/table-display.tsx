import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Text from "./text";

const TableStructure = ({
  label,
  value,
  iconName,
}: {
  label: string;
  value: string;
  iconName: keyof typeof MaterialIcons.glyphMap; // Explicit type for valid icon names
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.labelCont}>
        {iconName && (
          <MaterialIcons name={iconName} size={18} color={"#5C5C5C"} />
        )}
        <Text size="lg" weight="semiBold" style={styles.label}>
          {label}:
        </Text>
      </View>
      <View style={styles.valueCont}>
        <Text size="lg" weight="medium" style={styles.value}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
    width: "100%",
  },
  labelCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  label: {
    color: "#030229",
    paddingRight: 15,
    lineHeight: 19.2,
  },
  valueCont: {
    flex: 2,
    paddingVertical: 3,
  },
  value: {
    textAlign: "left",
    color: "#5C5C5C",
    lineHeight: 19.2,
  },
});

export default TableStructure;
