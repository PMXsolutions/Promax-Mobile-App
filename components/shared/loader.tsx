import React from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";
import { THEME } from "@/constants/theme";
import Text from "./text";

interface LoaderProps {
  name: "2-curves";
  color?: string;
  title?: string;
}

const Loader: React.FC<LoaderProps> = ({
  name,
  color,
  title = "Loading...",
}) => {
  if (name === "2-curves") {
    return (
      <View
        style={styles.container}
        accessibilityRole="progressbar"
        accessibilityLabel={title}
      >
        <StatusBar hidden />
        <ActivityIndicator size="large" color={color || THEME.colors.white} />
        <Text size="lg" weight="bold" style={{ color: "white", marginTop: 10 }}>
          {title}
        </Text>
      </View>
    );
  }

  return null;
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.colors.brand,
    justifyContent: "center",
    alignItems: "center",
  },
});
