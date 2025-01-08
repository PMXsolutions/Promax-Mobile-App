import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import { THEME } from "../../constants/theme";
import Text from "../shared/text";

const ProfileTag = ({
  label,
  value = "N/A",
}: {
  label: string;
  value: string;
}) => {
  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <View style={styles.label}>
          <Text weight="medium" size="md" style={styles.labelName}>
            {label}
          </Text>
          <Text weight="semiBold" size="base">
            {value}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ProfileTag;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: THEME.colors.lightGray,
  },
  label: {
    gap: 10,
  },
  labelName: {
    color: THEME.colors.grayBg,
  },
});
