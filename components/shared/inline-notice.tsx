import React from "react";
import { StyleSheet, View } from "react-native";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";

const InlineNotice = ({
  title,
  message,
  testID,
}: {
  title?: string;
  message: string;
  testID?: string;
}) => {
  return (
    <View
      style={styles.notice}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      {title ? (
        <Text weight="bold" size="sm">
          {title}
        </Text>
      ) : null}
      <Text size="sm">{message}</Text>
    </View>
  );
};

export default InlineNotice;

const styles = StyleSheet.create({
  notice: {
    backgroundColor: THEME.colors.toastBg.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    marginVertical: 8,
  },
});
