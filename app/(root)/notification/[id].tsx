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

const NotificationDetail = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;
  const { data: messageData, isLoading } =
    notificationQuery.useNotificationDetail(Number(id));

  React.useEffect(() => {
    invalidation();
  }, []);

  const invalidation = async () => {
    return queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });
  };

  if (isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Opening Notification.."
      />
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={`#${messageData?.messageId.toString() as string}`} />

      <View style={styles.content}>
        <Text weight="bold" size="3xl" style={{ marginBottom: 5 }}>
          {messageData?.subject}
        </Text>
      </View>
      <WebView
        originWhitelist={["*"]}
        source={{
          html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet">
          </head><body style="padding:10px">${
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
