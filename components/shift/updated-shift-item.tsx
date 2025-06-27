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
import { formattedDate, getActivityStatus } from "@/helpers/shift-service";
import Text from "../shared/text";
import { router } from "expo-router";

const UpdatedShiftItem = ({ item }: { item: AgendaProps }) => {
  const clientArr = item?.client!.split(", ");
  const defaultImage = require("../../assets/images/user-avatar.png");

  const activityStatus = getActivityStatus(item);
  const statusColor =
    activityStatus === "Present"
      ? "#10b981"
      : activityStatus === "Absent"
      ? "#ef4444"
      : activityStatus === "Shift In progress"
      ? "#f59e0b"
      : "#9ca3af";

  const isShiftInProgress = activityStatus === "Shift In progress";
  const isPending = item.status === "Pending";
  const isCancelled = item.status === "Cancelled";
  const isConfirmed = item.status === "Confirmed";

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

  const getStatusBadgeStyle = () => {
    if (isPending) {
      return {
        backgroundColor: "#fef3c7",
        borderColor: "#f59e0b",
        textColor: "#92400e",
      };
    } else if (isCancelled) {
      return {
        backgroundColor: "#fecaca",
        borderColor: "#ef4444",
        textColor: "#dc2626",
      };
    } else if (isConfirmed) {
      return {
        backgroundColor: "#dcfce7",
        borderColor: "#10b981",
        textColor: "#047857",
      };
    }
    return {
      backgroundColor: "#f3f4f6",
      borderColor: "#9ca3af",
      textColor: "#6b7280",
    };
  };

  const statusStyle = getStatusBadgeStyle();

  return (
    <TouchableWithoutFeedback onPress={handleShiftAction}>
      <View
        style={[
          styles.item,
          isCancelled && styles.cancelledItem,
          isPending && styles.pendingItem,
        ]}
      >
        {/* Left colored border indicator */}
        <View style={[styles.leftBorder, { backgroundColor: statusColor }]} />

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.imageContainer}>
              <View style={styles.avatarContainer}>
                <ImageBackground
                  source={defaultImage}
                  style={styles.userImg}
                  imageStyle={styles.userImgStyle}
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
                  <View style={styles.overlayContainer}>
                    <ImageBackground
                      source={defaultImage}
                      style={[styles.userImg, styles.overlayImg]}
                      imageStyle={styles.userImgStyle}
                    >
                      <Image
                        source={defaultImage}
                        style={styles.userImg}
                        resizeMode="cover"
                      />
                    </ImageBackground>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text weight="bold" size="lg" style={styles.clientName}>
                  {item?.client}
                </Text>
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
              </View>
              <Text
                weight="medium"
                size="sm"
                numberOfLines={3}
                style={styles.activityText}
              >
                {item?.activities}
              </Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <FontAwesome
                name="clock-o"
                size={14}
                color="#6b7280"
                style={styles.timeIcon}
              />
              <Text weight="medium" size="sm" style={styles.timeText}>
                {formattedDate(item?.dateFrom, "h:mm a")} -{" "}
                {formattedDate(item?.dateTo, "h:mm a")}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            {isShiftInProgress && (
              <View style={styles.inProgressBadge}>
                <View style={styles.pulsingDot} />
                <Text size="xs" weight="bold" style={styles.inProgressText}>
                  IN PROGRESS
                </Text>
              </View>
            )}

            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusStyle.backgroundColor,
                    borderColor: statusStyle.borderColor,
                  },
                ]}
              >
                <Text
                  size="xs"
                  weight="semiBold"
                  style={[styles.statusText, { color: statusStyle.textColor }]}
                >
                  {item?.status?.toUpperCase()}
                </Text>
              </View>
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
    backgroundColor: "#ffffff",
    borderRadius: 5,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cancelledItem: {
    opacity: 0.7,
  },
  pendingItem: {
    // Could add special styling for pending items
  },
  leftBorder: {
    width: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  avatarContainer: {
    position: "relative",
    width: 48,
    height: 48,
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  userImgStyle: {
    borderRadius: 20,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  overlayImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  clientName: {
    color: "#1f2937",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  activityText: {
    color: "#6b7280",
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 8,
  },
  timeText: {
    color: "#6b7280",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inProgressBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f59e0b",
    marginRight: 6,
  },
  inProgressText: {
    color: "#92400e",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

export default UpdatedShiftItem;
