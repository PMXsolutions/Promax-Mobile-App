import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Text from "../shared/text";
import { THEME } from "@/constants/theme";
import { ExternalPathString, RelativePathString, router } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

const ProfileLabel = ({
  iconName,
  label,
  link,
  index,
  edit,
  id,
}: {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  link: RelativePathString | ExternalPathString;
  index: number;
  edit: boolean;
  id: number;
}) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 200)
        .duration(1000)
        .springify()
        .damping(14)}
    >
      <TouchableWithoutFeedback
        onPress={() =>
          edit ? router.push(`${link}/${id} `) : router.push(link)
        }
      >
        <View style={styles.container}>
          <View style={styles.label}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: THEME.colors.lightGray,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={THEME.colors.primary}
              />
            </View>
            <Text weight="semiBold" size="base">
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
    </Animated.View>
  );
};

export default ProfileLabel;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderColor: THEME.colors.lightGray,
  },
  label: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
