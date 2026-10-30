import React from "react";
import { StyleSheet, View } from "react-native";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { useLocalSearchParams } from "expo-router";
import { notificationQuery } from "@/hooks/queries/notification";
import HeaderWhite from "@/components/shared/header-no-bg";
import { THEME } from "@/constants/theme";
import { WebView } from "react-native-webview";
import Text from "@/components/shared/text";
import { queryClient } from "@/libs/query";
import Loader from "@/components/shared/loader";
import ErrorState from "@/components/shared/error-state";
import useAuthStore from "@/store/use-auth-store";
import {
  notificationCompanyMatches,
  notificationListedForSession,
} from "@/libs/staff-record";

const NotificationDetail = () => {
  const query = useLocalSearchParams();
  const { user } = useAuthStore();

  const id = query.id as unknown as string;
  const listQuery = notificationQuery.useNotification(
    user?.userId ? String(user.userId) : ""
  );
  const listed = notificationListedForSession(listQuery.data, Number(id));
  const {
    data: messageData,
    isLoading,
    isError,
    refetch,
  } = notificationQuery.useNotificationDetail(Number(id), listed);

  React.useEffect(() => {
    invalidation();
  }, []);

  const invalidation = async () => {
    return queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });
  };

  if (listQuery.isLoading || (listed && isLoading)) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Opening Notification.."
      />
    );
  }

  if (listQuery.isError) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Notification"} />
        <ErrorState
          message="This notification could not be loaded."
          onRetry={() => {
            void listQuery.refetch();
          }}
        />
      </ScreenWrapper>
    );
  }

  if (!listed) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Notification"} />
        <View style={{ padding: 24 }}>
          <Text>This notification is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !messageData) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Notification"} />
        <ErrorState
          message="This notification could not be loaded."
          onRetry={() => {
            void refetch();
          }}
        />
      </ScreenWrapper>
    );
  }

  if (!notificationCompanyMatches(messageData, user?.companyId)) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Notification"} />
        <View style={{ padding: 24 }}>
          <Text>This notification is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={`#${messageData.messageId.toString()}`} />

      <View style={styles.content}>
        <Text weight="bold" size="2xl" style={{ marginBottom: 5 }}>
          {messageData.subject}
        </Text>
      </View>
      <WebView
        originWhitelist={["*"]}
        source={{
          html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body style="padding:10px">${messageData.content}</body></html>`,
        }}
      />
    </ScreenWrapper>
  );
};

export default NotificationDetail;

const styles = StyleSheet.create({
  content: {
    // rowGap: THEME.spacing.lg,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    marginTop: 10,
  },
});
