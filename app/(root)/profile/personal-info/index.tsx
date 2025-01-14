import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { THEME } from "@/constants/theme";
import { Image } from "react-native";
import ProfileTag from "@/components/profile/profile-tag";
import { formattedTime } from "@/helpers/shift-service";
import CustomButton from "@/components/shared/custom-button";
import { router } from "expo-router";

const PersonalInfo = () => {
  const { staff } = useAuthStore();

  const { data: staffData } = profileQuery.useFetchStaffProfile(
    staff?.staffId as number
  );
  const dob = new Date(staffData?.dateOfBirth as string);

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Personal Information"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 3 }}
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <ImageBackground
              source={require("@/assets/images/user-avatar.png")}
              style={styles.avatar}
              imageStyle={styles.avatar}
            >
              <Image
                source={{ uri: staffData?.imageUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </ImageBackground>
          </View>
        </View>
        <ProfileTag label={"Name"} value={staffData?.fullName!} />
        <ProfileTag label={"Phone Number"} value={staffData?.phoneNumber!} />
        <ProfileTag label={"Email"} value={staffData?.email!} />
        <ProfileTag label={"Gender"} value={staffData?.gender!} />

        {staffData && (
          <ProfileTag
            label={"Date of Birth"}
            value={formattedTime(dob, "d MMMM, yyyy")}
          />
        )}
        <ProfileTag label={"Nationality"} value={staffData?.country!} />
        <ProfileTag label={"State"} value={staffData?.state!} />
        <ProfileTag label={"City"} value={staffData?.city!} />
        <ProfileTag label={"Address"} value={staffData?.address!} />
        <ProfileTag label={"Suburb"} value={staffData?.suburb!} />
        <ProfileTag label={"Postcode"} value={staffData?.postcode!} />
      </ScrollView>
      <View style={styles.footer}>
        <CustomButton
          title="Edit"
          onPress={() =>
            router.push(`/(root)/profile/personal-info/${staffData?.staffId}`)
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default PersonalInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
  },

  profileContainer: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 1,
  },
  footer: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
  },
});
