import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { THEME } from "@/constants/theme";
import Text from "./text";
import GoBack from "../go-back";

const HeaderWhite = ({ name }: { name: string }) => {
  return (
    <View style={styles.header}>
      <View style={{ flex: 0.2 }}>
        {/* <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={THEME.colors.primary}
          />
        </TouchableOpacity> */}
        <GoBack mode="light" />
      </View>
      <View style={styles.section}>
        <Text
          weight="semiBold"
          size="xl"
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </View>
      <View></View>
    </View>
  );
};

export default HeaderWhite;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  section: {
    flex: 1,
    alignItems: "flex-start",
  },
  title: {
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
