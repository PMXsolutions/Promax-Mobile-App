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

const OtherInfo = () => {
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
            router.push(`/(root)/profile/personal-info/${staffData?.staffId}`)
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
