import React from "react";
import { View, StyleSheet } from "react-native";
import { THEME } from "@/constants/theme";
import Text from "./text";

const FormTableDisp = ({ label, value }: { label: string; value: string }) => {
  return (
    <View style={styles.row}>
      <View style={styles.labelCont}>
        <Text style={styles.label} size="md" weight="medium">
          {label}:
        </Text>
      </View>
      <View style={styles.valueCont}>
        <Text style={styles.value} size="md" weight="medium">
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
    paddingVertical: 10,
    width: "100%",

    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.lightGray,
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

export default FormTableDisp;
