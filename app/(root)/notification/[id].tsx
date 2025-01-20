import { StyleSheet, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { useLocalSearchParams } from "expo-router";
import { notificationQuery } from "@/hooks/queries/notification";
import HeaderWhite from "@/components/shared/header-no-bg";
import MiniLoader from "@/components/shared/mini-loader";
import { THEME } from "@/constants/theme";
import { WebView } from "react-native-webview";
import Text from "@/components/shared/text";

const NotificationDetail = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;
  const { data: messageData, isLoading } =
    notificationQuery.useNotificationDetail(Number(id));

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={""} />

      <MiniLoader visible={isLoading} title="Opening Notification" />

      <View style={styles.content}>
        <Text weight="bold" size="base" style={{ marginBottom: 5 }}>
          {messageData?.subject}
        </Text>
      </View>
      <WebView
        style={styles.content}
        originWhitelist={["*"]}
        // source={{ html: messageData?.content as string }}
        source={{
          html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body>${
            messageData?.content as string
          }</body></html>`,
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
