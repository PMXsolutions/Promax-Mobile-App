import React from "react";
import { View, StyleSheet, Dimensions, StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { THEME } from "@/constants/theme";
import Text from "./text";

interface LoaderProps {
  name: "2-curves";
  color?: string;
  title?: string;
}

const loaderheight = 50;

const Loader: React.FC<LoaderProps> = ({
  name,
  color,
  title = "Loading...",
}) => {
  const { width, height } = Dimensions.get("screen");

  // Shared value for rotation
  const rotation = useSharedValue(0);

  // Start the animation
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite
      false // No reverse
    );
  }, [rotation]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotation.value}deg`,
        },
      ],
    };
  });

  if (name === "2-curves") {
    return (
      <View style={[styles.container, { height, width }]}>
        <StatusBar barStyle={"light-content"} />
        <View style={[styles.loaderContainer]}>
          <Animated.View
            style={[
              styles.loader,
              {
                borderTopColor: color || "dodgerblue",
                borderBottomColor: color || "dodgerblue",
              },
              animatedStyle, // Add the animated style
            ]}
          />
        </View>
        <Text
          size="lg"
          weight="semiBold"
          style={{ color: "white", marginTop: 50 }}
        >
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
    backgroundColor: THEME.colors.primary || "black",
    justifyContent: "center",
    position: "absolute",
    alignItems: "center",
  },
  loaderContainer: {
    height: 80,
    width: 80,
    borderRadius: loaderheight,
    backgroundColor: "transparent",
  },
  loader: {
    position: "absolute",
    height: "100%",
    width: "100%",
    borderRadius: loaderheight,
    borderWidth: 5,
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    elevation: 5, // For Android
    zIndex: 50,
  },
});
