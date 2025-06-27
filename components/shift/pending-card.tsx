import React from "react";
import { View, StyleSheet, Image, ImageBackground } from "react-native";

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
    <View style={styles.item}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <ImageBackground
            source={defaultImage}
            style={styles.userImg}
            imageStyle={styles.userImgStyle}
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
              imageStyle={styles.userImgStyle}
            >
              <Image
                source={defaultImage}
                style={styles.userImg}
                resizeMode="cover"
              />
            </ImageBackground>
          )}
        </View>

        <View style={styles.headerText}>
          <Text weight="semiBold" size="lg" style={styles.clientName}>
            {item?.clients}
          </Text>
          <View style={styles.statusBadge}>
            <Text weight="medium" size="xs" style={styles.statusText}>
              PENDING
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text weight="medium" size="sm" style={styles.label}>
            Date
          </Text>
          <Text weight="semiBold" size="sm" style={styles.value}>
            {formattedTime(item?.dateCreated, "d MMM, yyyy")}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text weight="medium" size="sm" style={styles.label}>
            Time
          </Text>
          <Text weight="semiBold" size="sm" style={styles.value}>
            {formattedTime(item?.dateFrom, "h:mm a")} -{" "}
            {formattedTime(item?.dateTo, "h:mm a")}
          </Text>
        </View>
      </View>

      <View style={styles.actionSection}>
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
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: THEME.colors.light,
    borderRadius: 16,
    padding: THEME.spacing.md,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: THEME.spacing.sm,
  },

  avatarContainer: {
    position: "relative",
    marginRight: THEME.spacing.sm,
  },

  userImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.lightGray,
    borderWidth: 3,
    borderColor: "#fff",
  },

  userImgStyle: {
    borderRadius: 24,
  },

  overlayImg: {
    position: "absolute",
    right: -12,
    top: 4,
  },

  headerText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  clientName: {
    color: THEME.colors.dark,
    flex: 1,
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    color: "#D97706",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: THEME.spacing.sm,
  },

  detailsSection: {
    gap: 8,
    marginBottom: THEME.spacing.md,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#6B7280",
  },

  value: {
    color: THEME.colors.dark,
  },

  actionSection: {
    // alignItems: "flex-end",
  },
});

export default PendingCard;
