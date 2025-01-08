import React from "react";
import { View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { THEME } from "@/constants/theme";
import Text from "./text";
const MiniLoader = ({ visible = false, title = "Loading..." }) => {
  // const { width, height } = useWindowDimensions();
  const { width, height } = Dimensions.get("screen");
  return (
    visible && (
      <View style={[style.container, { height, width }]}>
        <View style={style.loader}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text
            weight="medium"
            size="lg"
            style={{
              marginLeft: 10,
            }}
          >
            {title}
          </Text>
        </View>
      </View>
    )
  );
};

const style = StyleSheet.create({
  loader: {
    height: 70,
    backgroundColor: THEME.colors.white,
    marginHorizontal: 50,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    minWidth: 80,
  },
  container: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
});

export default MiniLoader;
