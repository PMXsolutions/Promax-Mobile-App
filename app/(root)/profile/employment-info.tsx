import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { THEME } from "@/constants/theme";
import ProfileTag from "@/components/profile/profile-tag";
import { formattedTime } from "@/helpers/shift-service";

const EmploymentInfo = () => {
  const { staff } = useAuthStore();

  const { data: staffData } = profileQuery.useFetchStaffProfile(
    staff?.staffId as number
  );
  const djoined = new Date(staffData?.dateJoined as string);

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
          value={formattedTime(djoined, "d MMMM, yyyy")}
        />
        <ProfileTag label={"Salary"} value={staffData?.salary.toString()!} />

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
