import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { THEME } from "@/constants/theme";
import ProfileTag from "@/components/profile/profile-tag";
import CustomButton from "@/components/shared/custom-button";
import { router } from "expo-router";

const EmergencyInfo = () => {
  const { staff } = useAuthStore();

  const { data: staffData } = profileQuery.useFetchStaffProfile(
    staff?.staffId as number
  );

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Emergency Contact"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 3 }}
      >
        <ProfileTag label={"Name"} value={staffData?.nextOfKin!} />
        <ProfileTag label={"Email"} value={staffData?.kinEmail!} />
        <ProfileTag label={"Phone Number"} value={staffData?.kinPhoneNumber!} />
        <ProfileTag label={"Relationship"} value={staffData?.relationship!} />
        <ProfileTag label={"Nationality"} value={staffData?.kinCountry!} />
        <ProfileTag label={"State"} value={staffData?.kinState!} />
        <ProfileTag label={"City"} value={staffData?.kinCity!} />
        <ProfileTag label={"Address"} value={staffData?.kinAddress!} />
        <ProfileTag label={"Postcode"} value={staffData?.kinPostcode!} />
      </ScrollView>
      <View style={styles.footer}>
        <CustomButton
          title="Edit"
          onPress={() =>
            router.push(`/(root)/profile/emergency-info/${staffData?.staffId}`)
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default EmergencyInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
  },

  footer: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
  },
});
