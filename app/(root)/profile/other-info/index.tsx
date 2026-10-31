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

const OtherInfo = () => {
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
        <HeaderWhite name={"Other Information"} />
        <ErrorState
          message={
            denied
              ? "Your staff profile is not available."
              : "Other information could not be loaded."
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
      <HeaderWhite name={"Other Information"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 3 }}
      >
        <ProfileTag label={"Instagram"} value={staffData?.instagram!} />
        <ProfileTag label={"Linked-In"} value={staffData?.linkedIn!} />
        <ProfileTag label={"Facebook"} value={staffData?.facebook!} />
        <ProfileTag label={"Youtube"} value={staffData?.youtube!} />

        <ProfileTag label={"X (Formely Twitter)"} value={staffData?.twitter!} />
      </ScrollView>
      <View style={styles.footer}>
        <CustomButton
          title="Edit"
          onPress={() =>
            router.push(`/(root)/profile/other-info/${staffData?.staffId}`)
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default OtherInfo;

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
