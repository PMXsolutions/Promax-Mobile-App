import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { useLocalSearchParams } from "expo-router";
import HeaderWhite from "@/components/shared/header-no-bg";
import EditReportForm from "@/modules/report/edit-report-form";

import { reportQuery } from "@/hooks/queries/report";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import { shiftQuery } from "@/hooks/queries/shift";
import { reportListedForSession } from "@/libs/staff-record";
import { View } from "react-native";
import Text from "@/components/shared/text";

const ReportDetail = () => {
  const query = useLocalSearchParams();
  const { user, staff } = useAuthStore();

  const reportId = query.reportId as unknown as string;
  const rosterId = query.rosterId as unknown as string;
  const staffId = Number(staff?.staffId);
  const rosterQuery = shiftQuery.useShiftRoster(
    Number.isFinite(staffId) && staffId > 0 ? staffId : 0
  );
  const listed = reportListedForSession(
    rosterQuery.data,
    Number(rosterId),
    Number(reportId),
    {
      staffId: staff?.staffId,
      companyId: user?.companyId,
    }
  );
  const { data, isLoading } = reportQuery.useFetchReportInfo(
    Number(reportId),
    Number(rosterId),
    listed
  );
  if (rosterQuery.isLoading || (listed && isLoading)) {
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
        <HeaderWhite name={"Edit Shift Report"} />
        <View style={{ padding: 24 }}>
          <Text>This shift is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Edit Shift Report"} />
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      > */}

      <EditReportForm reportId={reportId} rosterId={rosterId} />

      {/* </KeyboardAvoidingView> */}
    </ScreenWrapper>
  );
};

export default ReportDetail;
