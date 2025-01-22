import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";

const PendingShift = ({ num }: { num: number }) => {
  return (
    <View style={styles.header}>
      <View style={styles.section}>
        <Text
          style={styles.title}
          weight="semiBold"
          size="md"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          You have pending shift report{" "}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.section}
        // onPress={() => navigation.navigate("ShiftPending", { penShift: shift })}
      >
        <Text style={[styles.title, { color: "#FFFF00" }]}>
          ({num}) Review Now
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PendingShift;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.gutter,
    paddingVertical: 10,
    backgroundColor: THEME.colors.secondary,
  },
  section: {
    // flex: 1,
    alignItems: "flex-start",
  },

  title: {
    color: "#030229",
  },
});
