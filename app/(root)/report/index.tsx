import React, { useEffect, useState } from "react";
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
import ErrorState from "@/components/shared/error-state";

const ReportDetail = () => {
  const query = useLocalSearchParams();
  const { user, staff, isAuthenticated, token } = useAuthStore();
  const [reportOpen, setReportOpen] = useState(false);

  const reportId = query.reportId as unknown as string;
  const rosterId = query.rosterId as unknown as string;
  const staffId = Number(staff?.staffId);
  const sessionOpen =
    isAuthenticated &&
    Boolean(token) &&
    Number.isFinite(staffId) &&
    staffId > 0;
  const rosterQuery = shiftQuery.useShiftRoster(sessionOpen ? staffId : 0);
  const listed = reportListedForSession(
    rosterQuery.data,
    Number(rosterId),
    Number(reportId),
    {
      staffId: staff?.staffId,
      companyId: user?.companyId,
    }
  );
  const { data, isLoading, isError, refetch } = reportQuery.useFetchReportInfo(
    Number(reportId),
    Number(rosterId),
    sessionOpen && listed
  );

  useEffect(() => {
    if (sessionOpen && listed && data) setReportOpen(true);
  }, [sessionOpen, listed, data]);

  if (!sessionOpen && !reportOpen) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Edit Shift Report"} />
        <View style={{ padding: 24 }}>
          <Text>Your sign-in has ended, so this report was not opened.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (sessionOpen && rosterQuery.isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Report.."
      />
    );
  }

  if (sessionOpen && rosterQuery.isError) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Edit Shift Report"} />
        <ErrorState
          message="This report could not be loaded."
          onRetry={() => {
            void rosterQuery.refetch();
          }}
        />
      </ScreenWrapper>
    );
  }

  if (sessionOpen && !listed) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Edit Shift Report"} />
        <View style={{ padding: 24 }}>
          <Text>This shift is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (sessionOpen && isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Report.."
      />
    );
  }

  if (sessionOpen && (isError || !data)) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Edit Shift Report"} />
        <ErrorState
          message="This report could not be loaded."
          onRetry={() => {
            void refetch();
          }}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Edit Shift Report"} />
      {!sessionOpen && (
        <View style={{ padding: 24 }}>
          <Text>
            Your sign-in has ended. The typed report is still on this screen and was not sent.
          </Text>
        </View>
      )}
      <EditReportForm reportId={reportId} rosterId={rosterId} />
    </ScreenWrapper>
  );
};

export default ReportDetail;
