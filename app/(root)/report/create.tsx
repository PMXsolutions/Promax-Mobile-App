import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { View } from "react-native";
import AddReportForm from "@/modules/report/add-report-form";
import { useLocalSearchParams } from "expo-router";
import useAuthStore from "@/store/use-auth-store";
import { shiftQuery } from "@/hooks/queries/shift";
import { shiftListedForSession } from "@/libs/staff-record";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";

const ReportCreate = () => {
  const query = useLocalSearchParams();
  const { user, staff } = useAuthStore();
  const rosterId = query.rosterId as unknown as string;
  const staffId = Number(staff?.staffId);
  const rosterQuery = shiftQuery.useShiftRoster(
    Number.isFinite(staffId) && staffId > 0 ? staffId : 0
  );
  const listed = shiftListedForSession(rosterQuery.data, Number(rosterId), {
    staffId: staff?.staffId,
    companyId: user?.companyId,
  });

  if (rosterQuery.isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Report.."
      />
    );
  }

  if (!listed) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Add Shift Report"} />
        <View style={{ padding: 24 }}>
          <Text>This shift is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Add Shift Report"} />
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      > */}
      <AddReportForm rosterId={rosterId} />
      {/* </KeyboardAvoidingView> */}
    </ScreenWrapper>
  );
};

export default ReportCreate;
