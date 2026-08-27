import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React from "react";
import { StaffProfile } from "@/types/auth";
import Text from "../shared/text";
import { THEME } from "@/constants/theme";

const ProfileHeaderContent = ({ data }: { data: StaffProfile }) => {
  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <View>
          <ImageBackground
            source={require("../../assets/images/user-avatar.png")}
            style={styles.userImg}
            imageStyle={styles.userImg}
          >
            <Image
              source={{ uri: data?.imageUrl }}
              style={[styles.userImg, { borderWidth: 1 }]}
              resizeMode="cover"
            />
          </ImageBackground>
        </View>

        <View style={styles.contentContainer}>
          <Text weight="bold" size="xl" numberOfLines={1} ellipsizeMode="tail">
            {data?.fullName || "********* *********"}
          </Text>
          <Text
            weight="semiBold"
            size="md"
            style={styles.subtitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {data?.email || "*******************"}
          </Text>
          <Text
            weight="regular"
            size="sm"
            style={[styles.subtitle, { color: "#000" }]}
          >
            {data?.maxStaffId || "******"}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const ProfileHeader = ({ data }: { data: StaffProfile }) => {
  return <ProfileHeaderContent data={data} />;
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: THEME.colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderRadius: 5,
    borderColor: THEME.colors.lightGray,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },

  userImg: {
    width: 90,
    height: 90,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    borderColor: THEME.colors.lightGray,
    overflow: "hidden",
  },
  contentContainer: {
    gap: 4,
    flex: 1,
  },

  subtitle: {
    color: "#5C5C5C",
  },
});
