import React from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
} from "react-native";

import { ShiftRosterType } from "@/types/shift";
import { formattedTime } from "@/helpers/shift-service";
import { THEME } from "@/constants/theme";
import Text from "../shared/text";
import { router } from "expo-router";
import CustomButton from "../shared/custom-button";

const PendingCard = ({ item }: { item: ShiftRosterType }) => {
  const clientArr = item?.clients!.split(", ");
  const defaultImage = require("../../assets/images/user-avatar.png");

  return (
    <TouchableWithoutFeedback>
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          <View style={styles.avatarContainer}>
            <ImageBackground
              source={defaultImage}
              style={styles.userImg}
              imageStyle={styles.userImg}
            >
              {item?.profile.imageUrl && (
                <Image
                  source={{ uri: item?.profile.imageUrl }}
                  style={styles.userImg}
                  resizeMode="cover"
                />
              )}
            </ImageBackground>
            {clientArr?.length > 1 && (
              <ImageBackground
                source={defaultImage}
                style={[styles.userImg, styles.overlayImg]}
                imageStyle={styles.userImg}
              >
                <Image
                  source={defaultImage}
                  style={styles.userImg}
                  resizeMode="cover"
                />
              </ImageBackground>
            )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text weight="semiBold" size="md">
            {item?.clients}
          </Text>
          <Text weight="medium" size="md" style={styles.subtext}>
            Date: {formattedTime(item?.dateCreated, "d MMMM, yyyy")}
          </Text>
          <Text weight="medium" size="md" style={styles.subtext}>
            Start Time: {formattedTime(item?.dateFrom, "h:mm a")}
          </Text>
          <Text weight="medium" size="md" style={styles.subtext}>
            End Time: {formattedTime(item?.dateTo, "h:mm a")}
          </Text>

          <View style={styles.btnContainer}>
            <CustomButton
              title="Fill Report"
              onPress={() =>
                router.push({
                  pathname: "/(root)/report/create",
                  params: {
                    rosterId: item?.shiftRosterId,
                  },
                })
              }
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    padding: THEME.spacing.sm,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.light,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 20,
  },
  imageContainer: {
    marginRight: THEME.spacing.sm,
  },
  avatarContainer: {
    paddingHorizontal: 5,
    height: 50,
    position: "relative",
  },
  userImg: {
    width: 30,
    height: 30,
    borderRadius: 17.5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.lightGray,
  },
  overlayImg: {
    position: "absolute",
    left: 15, // Adjust this value to control the overlap
    borderColor: "#fff", // Optional: Add a border to separate the images
  },
  detailsContainer: {
    flex: 1,
    gap: 4,
    position: "relative",
  },
  statusIcon: {
    position: "absolute",
    top: 0,
    right: 0,
  },

  subtext: {
    color: "#5C5C5C",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 4,
  },
  inProgressBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: THEME.colors.secondary,
  },

  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
});

export default PendingCard;
