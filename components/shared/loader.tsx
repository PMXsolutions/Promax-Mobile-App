import React, { useRef } from "react";
import { View, StyleSheet, Dimensions, StatusBar } from "react-native";
import { THEME } from "@/constants/theme";
import Text from "./text";
import LottieView from "lottie-react-native";

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
  const animation = useRef<LottieView>(null);
  const { width, height } = Dimensions.get("screen");

  if (name === "2-curves") {
    return (
      <View style={[styles.container, { height, width }]}>
        <StatusBar barStyle={"light-content"} />

        <LottieView
          ref={animation}
          source={require("../../assets/json/lotiie2.json")}
          autoPlay={true}
          loop={true}
          style={{
            width: 200,
            height: 200,
            backgroundColor: THEME.colors.brand,
          }}
        />
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
    backgroundColor: THEME.colors.brand,
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
