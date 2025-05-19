import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { notificationQuery } from "@/hooks/queries/notification";
import useAuthStore from "@/store/use-auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import HeaderWhite from "@/components/shared/header-no-bg";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import MiniLoader from "@/components/shared/mini-loader";
import EmptyData from "@/components/shared/empty-data";
import { formattedTime } from "@/helpers/shift-service";
import { NotificationType } from "@/types/notication";
import { notificationService } from "@/services/notification";
import { showMessage } from "react-native-flash-message";
import { router } from "expo-router";

const Notification = () => {
  const { user } = useAuthStore();

  const {
    data: notificationData,
    isLoading,
    error,
    isFetching: isRefetching,
    refetch,
  } = notificationQuery.useNotification(user?.userId as string);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Unread");
  const filteredNotification = notificationData?.filter((notification) =>
    activeTab === "Unread" ? !notification.status : notification.status
  );

  const rowRefs = useRef<(Swipeable | null)[]>([]); // Array of refs for Swipeable components

  const [currentlyOpenRow, setCurrentlyOpenRow] = useState<number | null>(null); // Track the currently open row

  const onRefresh = async () => {
    await refetch();
  };

  const closePreviouslyOpenedRow = () => {
    if (currentlyOpenRow !== null && rowRefs.current[currentlyOpenRow]) {
      rowRefs.current[currentlyOpenRow]?.close();
    }
  };

  const handleSwipeableOpen = (index: number) => {
    // Close previously opened row
    if (currentlyOpenRow !== index) {
      closePreviouslyOpenedRow();
    }
    // Set the new currently open row
    setCurrentlyOpenRow(index);
  };
  const { mutate: onDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      return notificationService.deleteNotification(id); // Ensure this API call works
    },
    onSuccess: ({ data }) => {
      showMessage({
        message: data.message,
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      showMessage({
        message: error.response?.data?.message,
        type: "danger",
      });
    },
  });

  const deleteItem = (item: NotificationType) => {
    onDelete(item.messageId);
    setCurrentlyOpenRow(null); // Reset currently open row after deletion
    // Add your delete logic here
  };

  const renderRightActions = (
    progress: any,
    dragX: any,
    onClick: () => void
  ) => (
    <View style={styles.actionContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={onClick}>
        {isDeleting ? (
          <ActivityIndicator color={THEME.colors.white} />
        ) : (
          <MaterialCommunityIcons name="delete" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationType;
    index: number;
  }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, () => deleteItem(item))
      }
      onSwipeableOpen={() => handleSwipeableOpen(index)} // Handle row opening
      onSwipeableClose={() => {
        if (currentlyOpenRow === index) {
          setCurrentlyOpenRow(null); // Reset currently open row when closed
        }
      }}
      ref={(ref) => (rowRefs.current[index] = ref)} // Store the ref for each item
    >
      <TouchableWithoutFeedback
        onPress={() => router.push(`/(root)/notification/${item.messageId}`)}
      >
        <View
          style={[
            styles.notificationCard,
            item.status ? styles.read : styles.unread,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={
                item.status ? THEME.colors.lightGray : THEME.colors.secondary
              }
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.notificationTitle} weight="bold" size="md">
              {item?.subject || "(No Subject)"}
            </Text>
            <Text style={styles.notificationDate}>
              {formattedTime(
                new Date(item?.dateCreated),
                "d MMMM, yyyy hh:mm a"
              )}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Swipeable>
  );

  return (
    <ScreenWrapper barStyle="dark-content">
      <MiniLoader visible={isLoading} title="Loading Notification" />
      <HeaderWhite name={"Notification"} />

      <View style={[styles.container]}>
        {/* {filteredNotification && filteredNotification?.length <= 0 && (
          <EmptyData />
        )} */}
        <FlatList
          data={filteredNotification}
          renderItem={renderItem}
          keyExtractor={(item) => item.messageId!.toString()}
          style={styles.notificationList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 15,
            gap: 2,
            marginVertical: 10,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              progressBackgroundColor="#fff"
              colors={[THEME.colors.primary]}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={{ marginTop: 150 }}>
              <EmptyData />
            </View>
          }
        />

        {/* Bottom Tab */}
        <View style={styles.bottomTab}>
          <TouchableOpacity
            onPress={() => setActiveTab("Unread")}
            style={styles.tabButton}
          >
            <Ionicons
              name="mail-unread"
              size={24}
              color={activeTab === "Unread" ? THEME.colors.brand : "#999"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "Unread" && styles.activeTabText,
              ]}
            >
              Unread
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("Read")}
            style={styles.tabButton}
          >
            <Ionicons
              name="mail-open"
              size={24}
              color={activeTab === "Read" ? THEME.colors.brand : "#999"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "Read" && styles.activeTabText,
              ]}
            >
              Read
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  notificationList: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: 3,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: THEME.colors.lightGray,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.brand,
  },
  read: {
    borderLeftWidth: 4,
    borderLeftColor: "#D1D1D6",
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    color: "#333",
  },
  notificationDate: {
    fontSize: 12,
    color: "#999",
  },
  bottomTab: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#D1D1D6",
  },
  tabButton: {
    alignItems: "center",
    width: 100,
  },
  tabText: {
    fontSize: THEME.fontSize.sm,
    color: "#999",
  },
  activeTabText: {
    color: THEME.colors.brand,
    fontFamily: THEME.fontFamily.bold,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    paddingHorizontal: 10,
    gap: 4,
  },
  actionButton: {
    backgroundColor: THEME.colors.error,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 5,
    paddingHorizontal: 15,
    borderCurve: "continuous",
  },
});
