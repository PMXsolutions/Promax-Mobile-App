import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import { router } from "expo-router";

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
          You have{" "}
          <Text weight="bold" style={{ color: "#FFFF00" }}>
            {" "}
            ({num})
          </Text>{" "}
          pending shift report{" "}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.section}
        onPress={() => router.push("/(root)/shift/pending")}
      >
        <Text style={[styles.title, { color: "#FFFF00" }]}>Review Now</Text>
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
    paddingVertical: 15,
    backgroundColor: THEME.colors.red,
  },
  section: {
    // flex: 1,
    alignItems: "flex-start",
  },

  title: {
    color: THEME.colors.white,
  },
});
