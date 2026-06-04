import React from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { AgendaProps } from "@/types/shift";
import { formattedTime, getActivityStatus } from "@/helpers/shift-service";
import { THEME } from "@/constants/theme";
import Text from "../shared/text";
import { router } from "expo-router";

const ShiftItem = ({ item }: { item: AgendaProps }) => {
  // Recently updated: partial roster rows should still render instead of crashing the shift list.
  const clientArr = (item?.client ?? "").split(", ").filter(Boolean);
  const defaultImage = require("../../assets/images/user-avatar.png");

  const activityStatus = getActivityStatus(item);
  const statusColor =
    activityStatus === "Present"
      ? "green"
      : activityStatus === "Absent"
      ? THEME.colors.red
      : "#ccc";

  const isShiftInProgress = activityStatus === "Shift In progress";
  const isPending = item.status === "Pending";
  const isCancelled = item.status === "Cancelled";

  const handleShiftAction = () => {
    if (isPending) {
      Alert.alert(
        "Pending",
        "Awaiting feedback from Admin on your cancellation request"
      );
    } else if (isCancelled) {
      Alert.alert("Cancelled", "This shift has been cancelled");
    } else {
      router.push({
        pathname: "/(root)/shift",
        params: { id: item.shiftRosterId, clients: item.client },
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleShiftAction}>
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          <View style={styles.avatarContainer}>
            <ImageBackground
              source={defaultImage}
              style={styles.userImg}
              imageStyle={styles.userImg}
            >
              {item?.image && (
                <Image
                  source={{ uri: item.image }}
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
          <FontAwesome
            color={statusColor}
            name="circle"
            size={9}
            style={styles.statusIcon}
          />
          <Text weight="semiBold" size="md">
            {item?.client}
          </Text>
          <Text weight="medium" size="md" style={styles.subtext}>
            Start Time: {formattedTime(item?.dateFrom, "h:mm a")}
          </Text>
          <Text weight="medium" size="md" style={styles.subtext}>
            End Time: {formattedTime(item?.dateTo, "h:mm a")}
          </Text>

          <View style={styles.btnContainer}>
            {isShiftInProgress && (
              <View style={styles.inProgressBadge}>
                <Text size="sm" weight="bold">
                  Shift In Progress
                </Text>
              </View>
            )}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isPending
                    ? THEME.colors.secondary
                    : isCancelled
                    ? THEME.colors.red
                    : "transparent",
                },
              ]}
            >
              <Text
                size="sm"
                weight="regular"
                style={{
                  color: isPending
                    ? THEME.colors.black
                    : isCancelled
                    ? THEME.colors.white
                    : "#ccc",
                }}
              >
                {item?.status}
              </Text>
            </View>
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
    backgroundColor: "#fff",
    borderRadius: 5,
    marginRight: THEME.spacing.sm,
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

export default ShiftItem;
