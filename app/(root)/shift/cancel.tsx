import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { THEME } from "@/constants/theme";
import ShiftCancelForm from "@/modules/shift/shift-cancel-form";
import useAuthStore from "@/store/use-auth-store";
import { shiftQuery } from "@/hooks/queries/shift";
import { shiftListedForSession } from "@/libs/staff-record";
import Loader from "@/components/shared/loader";
import Text from "@/components/shared/text";

const ShiftCancel = () => {
  const query = useLocalSearchParams();
  const { user, staff } = useAuthStore();
  const id = query.id as unknown as string;
  const staffId = Number(staff?.staffId);
  const rosterQuery = shiftQuery.useShiftRoster(
    Number.isFinite(staffId) && staffId > 0 ? staffId : 0
  );
  const listed = shiftListedForSession(rosterQuery.data, Number(id), {
    staffId: staff?.staffId,
    companyId: user?.companyId,
  });

  if (rosterQuery.isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Shift.."
      />
    );
  }

  if (!listed) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Cancel Shift"} />
        <View style={{ padding: 24 }}>
          <Text>This shift is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Cancel Shift"} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ShiftCancelForm shiftId={Number(id)} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ShiftCancel;

const styles = StyleSheet.create({
  content: {
    // rowGap: THEME.spacing.lg,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    // marginTop: 10,
  },
});
