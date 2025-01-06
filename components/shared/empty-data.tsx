import { Image, StyleSheet, View } from "react-native";
import React from "react";
import Text from "./text";
import { THEME } from "@/constants/theme";

const EmptyData = () => {
  return (
    <View style={styles.container}>
      <View style={{ width: 400, height: 200 }}>
        <Image
          resizeMode="contain"
          style={{ width: "100%", height: "100%" }}
          source={require("../../assets/images/empty_data_icon.png")}
        />
      </View>

      <Text
        weight="medium"
        size="lg"
        style={{
          marginTop: 30,
          color: THEME.colors.grayBg,
        }}
      >
        {"No data available"}
      </Text>
    </View>
  );
};

export default EmptyData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
