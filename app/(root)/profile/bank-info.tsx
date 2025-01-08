import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { THEME } from "@/constants/theme";
import ProfileTag from "@/components/profile/profile-tag";

const BankInfo = () => {
  const { staff } = useAuthStore();

  const { data: staffData } = profileQuery.useFetchStaffProfile(
    staff?.staffId as number
  );

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
