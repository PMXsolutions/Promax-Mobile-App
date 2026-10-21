import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { THEME } from "@/constants/theme";
import ProfileTag from "@/components/profile/profile-tag";
import { displaySydneyDate } from "@/libs/display-date";
import ErrorState from "@/components/shared/error-state";
import Loader from "@/components/shared/loader";

const EmploymentInfo = () => {
  const { staff } = useAuthStore();

  const {
    data: staffData,
    isLoading,
    isError,
    error,
    refetch,
  } = profileQuery.useFetchStaffProfile(staff?.staffId as number);

  if (isLoading) {
    return (
      <Loader name="2-curves" color={THEME.colors.secondary} title="Loading..." />
    );
  }

  if (isError || !staffData) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Employment Details"} />
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Employment details could not be loaded."
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
      <HeaderWhite name={"Employment Details"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 3 }}
      >
        <ProfileTag
          label={"Employment Type"}
          value={staffData?.employmentType!}
        />
        <ProfileTag
          label={"Pay Rate"}
          value={staffData?.payRate?.toString()!}
        />
        <ProfileTag
          label={"Date Joined"}
          value={displaySydneyDate(staffData.dateJoined)}
        />
        <ProfileTag
          label={"Salary"}
          value={staffData.salary == null ? "" : String(staffData.salary)}
        />

        <ProfileTag label={"Level"} value={staffData?.level!} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default EmploymentInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
  },
});
