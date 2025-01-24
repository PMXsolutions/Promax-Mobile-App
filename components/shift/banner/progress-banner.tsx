import { StyleSheet, View } from "react-native";
import React from "react";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";

const ProgressBanner = ({ shiftId }: { shiftId: number }) => {
  return (
    <View style={styles.header}>
      <View style={styles.section}>
        <Text style={styles.title} weight="semiBold" size="md">
          Shift (#{shiftId}) in Progress
        </Text>
      </View>
    </View>
  );
};

export default ProgressBanner;

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
