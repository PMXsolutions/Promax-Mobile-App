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
import ErrorState from "@/components/shared/error-state";
import Loader from "@/components/shared/loader";
import {
  profileErrorStatus,
  profileVisibleToSession,
} from "@/libs/staff-record";

const EmergencyInfo = () => {
  const { staff, user } = useAuthStore();

  const {
    data: staffData,
    isFetching,
    isError,
    error,
    refetch,
  } = profileQuery.useFetchStaffProfile(staff?.staffId as number);
  const sessionStaffId = Number(staff?.staffId);
  const hasStaff = Number.isFinite(sessionStaffId) && sessionStaffId > 0;
  const denied =
    !hasStaff ||
    profileErrorStatus(error) === 403 ||
    (staffData != null &&
      !profileVisibleToSession(staffData, {
        staffId: sessionStaffId,
        companyId: user?.companyId,
      }));

  if (hasStaff && isFetching) {
    return (
      <Loader name="2-curves" color={THEME.colors.secondary} title="Loading..." />
    );
  }

  if (denied || isError || !staffData) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Emergency Contact"} />
        <ErrorState
          message={
            denied
              ? "Your staff profile is not available."
              : "Emergency contact could not be loaded."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      </ScreenWrapper>
    );
  }

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
