import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "./text";
import CustomButton from "./custom-button";
import { THEME } from "@/constants/theme";

interface Props {
  message?: string;
  onRetry: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  icon = "alert-circle-outline",
}: Props) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={THEME.colors.grayBg}
        style={styles.icon}
      />
      <Text size="lg" weight="semiBold" style={styles.message}>
        {message}
      </Text>
      <CustomButton title="Retry" onPress={onRetry} />
    </View>
  );
};

export default ErrorState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 16,
    color: THEME.colors.grayBg,
  },
});
