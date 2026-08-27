import { FlatList, StyleSheet } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { THEME } from "@/constants/theme";
import { shiftQuery } from "@/hooks/queries/shift";
import useAuthStore from "@/store/use-auth-store";
import { getActivityDetailStatus } from "@/helpers/shift-service";
import PendingCard from "@/components/shift/pending-card";

const ShiftPending = () => {
  const { staff } = useAuthStore();
  const { data } = shiftQuery.useShiftRoster(staff?.staffId!);

  const filteredShifts =
    data?.filter(
      (activity) =>
        activity.status !== "Cancelled" &&
        getActivityDetailStatus(activity, new Date()) === "Present" &&
        !activity?.isShiftReportSigned
    ) || [];

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Pending Shift Report"} />

      {filteredShifts?.length > 0 && (
        <FlatList
          data={filteredShifts}
          keyExtractor={(item) => item.shiftRosterId.toString()}
          renderItem={({ item }) => <PendingCard item={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

export default ShiftPending;

const styles = StyleSheet.create({
  content: {
    // rowGap: THEME.spacing.lg,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    // marginTop: 10,
  },
});
