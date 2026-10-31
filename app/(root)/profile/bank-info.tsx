import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { THEME } from "@/constants/theme";
import ProfileTag from "@/components/profile/profile-tag";
import ErrorState from "@/components/shared/error-state";
import Loader from "@/components/shared/loader";
import {
  profileErrorStatus,
  profileVisibleToSession,
} from "@/libs/staff-record";

const BankInfo = () => {
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
        <HeaderWhite name={"Bank Information"} />
        <ErrorState
          message={
            denied
              ? "Your staff profile is not available."
              : "Bank information could not be loaded."
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
      <HeaderWhite name={"Bank Information"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 3 }}
      >
        <ProfileTag label={"Bank Name"} value={staffData?.bankName!} />
        <ProfileTag label={"Account Name"} value={staffData?.accountName!} />
        <ProfileTag
          label={"Account Number"}
          value={staffData?.accountNumber!}
        />
        <ProfileTag label={"Branch"} value={staffData?.branch!} />
        <ProfileTag label={"BSB"} value={staffData?.bsb!} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default BankInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
  },
});
