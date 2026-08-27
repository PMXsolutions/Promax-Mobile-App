import React from "react";
import { StyleSheet, View } from "react-native";

import Text from "@/components/shared/text";
import { ShiftRosterType } from "@/types/shift";

const SmallMap = ({ shiftInfo }: { shiftInfo: ShiftRosterType }) => {
  const hasLocation =
    Boolean(shiftInfo?.profile) &&
    shiftInfo.profile.latitude !== 0 &&
    shiftInfo.profile.longitude !== 0;

  return (
    <View
      accessibilityLabel="Client location summary"
      style={styles.container}
    >
      <Text weight="semiBold" style={styles.title}>
        Client location
      </Text>
      <Text style={styles.body}>
        {hasLocation
          ? `${shiftInfo.profile.fullName || "Client"} location is recorded. Open this shift in the iOS or Android app for the interactive map.`
          : "No client coordinates are recorded for this shift."}
      </Text>
    </View>
  );
};

export default SmallMap;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 150,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#dbe3df",
    borderRadius: 12,
    backgroundColor: "#f5f8f6",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    color: "#153f38",
    marginBottom: 8,
  },
  body: {
    color: "#52645f",
    lineHeight: 21,
  },
});
