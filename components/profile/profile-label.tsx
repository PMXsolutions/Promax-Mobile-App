import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Text from "../shared/text";
import { THEME } from "@/constants/theme";
import { ExternalPathString, RelativePathString, router } from "expo-router";

const ProfileLabel = ({
  iconName,
  label,
  link,
}: {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  link: RelativePathString | ExternalPathString;
}) => {
  const navigation = useNavigation();
  return (
    <TouchableWithoutFeedback onPress={() => router.push(link)}>
      <View style={styles.container}>
        <View style={styles.label}>
          <MaterialCommunityIcons
            name={iconName}
            size={24}
            color={THEME.colors.grayBg}
          />
          <Text weight="medium" size="md">
            {label}
          </Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={22}
          color={THEME.colors.grayBg}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ProfileLabel;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: THEME.colors.lightGray,
  },
  label: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
