import { Image, ImageBackground, StyleSheet, View } from "react-native";
import React from "react";
import Text from "../shared/text";
import { THEME } from "@/constants/theme";

const UserHeader = ({
  image,
  name,
  role,
}: {
  image: string;
  name: string;
  role: string;
}) => {
  const defaultImage = "../../assets/images/user-avatar.png";
  return (
    <View style={styles.userSection}>
      <View>
        <ImageBackground
          source={require(defaultImage)}
          style={styles.avatar}
          imageStyle={styles.avatar}
        >
          <Image
            source={{ uri: image }}
            style={styles.avatar}
            resizeMode="cover"
            // onError={(e) => {
            //   console.log("Error loading image: ", e);
            // }}
          />
        </ImageBackground>
      </View>
      <View>
        <Text
          style={styles.name}
          size="md"
          weight="semiBold"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </View>
      <Text style={styles.label} size="md" weight="medium">
        {role}
      </Text>
    </View>
  );
};

export default UserHeader;

const styles = StyleSheet.create({
  userSection: {
    alignItems: "center",
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
    borderColor: THEME.colors.lightGray,
    // borderStyle: "dashed",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginBottom: 5,
  },
  name: {
    marginHorizontal: 4,
    // lineHeight: 19.2,
    // flex: 1,
  },
  label: {
    color: "#888",
    // lineHeight: 22.4,
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
