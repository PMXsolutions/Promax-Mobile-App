import {
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useRef } from "react";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { THEME } from "@/constants/theme";
import Header from "@/components/shared/header";
import { Animated } from "react-native";
import Text from "@/components/shared/text";
import ProfileHeader from "@/components/profile/profile-header";
import { labelArr } from "@/constants/profile-data";
import ProfileLabel from "@/components/profile/profile-label";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Loader from "@/components/shared/loader";

const Profile = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const opacityTitle = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 40],
    extrapolate: "clamp",
  });
  const { staff, isAuthenticated, logout } = useAuthStore();

  const {
    data: staffData,
    isLoading,
    error,
  } = profileQuery.useFetchStaffProfile(staff?.staffId as number);

  if (isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Shift.."
      />
    );
  }
  if (error) {
    return <Text>Error fetching data</Text>;
  }
  return (
    <ScreenWrapper
      statusBgColor={THEME.colors.brand}
      bgColor={THEME.colors.brand}
      barStyle="light-content"
    >
      <View
        style={[
          // styles.header,
          { backgroundColor: THEME.colors.brand, paddingBottom: 10 },
        ]}
      >
        <Header
          name={`Profile`}
          image={staff?.imageUrl!}
          opacityTitle={opacityTitle}
          translateTitle={translateTitle}
        />
      </View>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader data={staffData!} />

          <View style={{ paddingVertical: 15, rowGap: THEME.spacing.md }}>
            {labelArr.map((item, index) => (
              <ProfileLabel
                key={index} // Ensure a unique key for each item
                iconName={item.iconName}
                label={item.title}
                link={item.url}
              />
            ))}
          </View>
          <TouchableWithoutFeedback
            // onPress={() => setLogOutModal(true)}
            onPress={logout}
          >
            <View style={styles.butcontainer}>
              <View style={styles.label}>
                <MaterialCommunityIcons
                  name={"logout"}
                  size={24}
                  color={THEME.colors.red}
                />
                <Text style={styles.labelName} size="md" weight="regular">
                  {"Logout"}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={THEME.colors.red}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  content: {
    rowGap: THEME.spacing.lg,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
  },
  butcontainer: {
    marginVertical: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: THEME.colors.lightGray,
  },
  label: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  labelName: {
    color: THEME.colors.red,
  },
});
