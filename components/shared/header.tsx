import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import Icons from "@expo/vector-icons/MaterialIcons";
import Text from "./text";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { notificationQuery } from "@/hooks/queries/notification";
import { router } from "expo-router";

interface Props {
  name: string;
  role?: string;
  image: string;
  opacityTitle: Animated.AnimatedInterpolation<string | number>;
  translateTitle: Animated.AnimatedInterpolation<string | number>;
}
const Header = ({ opacityTitle, translateTitle, name, image }: Props) => {
  //   const AVATAR_URL =
  //     "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80";

  const { user, staff } = useAuthStore();
  const { data: staffData } = profileQuery.useFetchStaffProfile(
    staff?.staffId as number
  );
  const { data: notifiData } = notificationQuery.useNotification(
    user?.userId as string
  );
  const filteredNotification = notifiData?.filter(
    (item) => item.status === false
  );

  return (
    <Animated.View
      style={[
        {
          opacity: opacityTitle,
          paddingHorizontal: THEME.spacing.sm,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        ,
        { transform: [{ translateY: translateTitle }] },
      ]}
    >
      {staffData && (
        <Image
          source={{
            uri: staffData.imageUrl,
          }}
          style={{ width: 40, aspectRatio: 1, borderRadius: 52 }}
          resizeMode="cover"
        />
      )}

      <View style={{ flex: 1 }}>
        <Text
          size="xl"
          weight="bold"
          style={{
            marginBottom: 4,
            color: THEME.colors.white,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        {/* <Text
          size="md"
          weight="medium"
          style={{ color: THEME.colors.white, opacity: 0.75 }}
          numberOfLines={1}
        >
          {role}
        </Text> */}
      </View>
      <View>
        <TouchableOpacity
          style={{
            width: 40,
            aspectRatio: 1,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 52,
            // borderWidth: 1,
            backgroundColor: THEME.colors.grayBg,
          }}
          onPress={() => router.push("/(root)/notification")}
        >
          <Icons name="notifications" size={24} color={THEME.colors.white} />
        </TouchableOpacity>

        {filteredNotification && filteredNotification?.length > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{filteredNotification?.length}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  badgeContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: THEME.colors.secondary,
    borderRadius: 8,
    width: 17,
    height: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
  },
});
