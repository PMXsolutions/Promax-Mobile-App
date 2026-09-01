import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { useLocalSearchParams } from "expo-router";
import HeaderWhite from "@/components/shared/header-no-bg";
import EditReportForm from "@/modules/report/edit-report-form";

import { reportQuery } from "@/hooks/queries/report";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import ErrorState from "@/components/shared/error-state";

const ReportDetail = () => {
  const query = useLocalSearchParams();

  const reportId = query.reportId as unknown as string;
  const rosterId = query.rosterId as unknown as string;
  const { data, isLoading, isError, refetch } = reportQuery.useFetchReportInfo(
    Number(reportId),
    Number(rosterId)
  );
  // const load = true;
  if (isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Report.."
      />
    );
  }

  if (isError || !data) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Edit Shift Report"} />
        {/* Recently updated: prevent blank report forms after failed report loads. */}
        <ErrorState
          message="Unable to load this shift report. Please check your connection and try again."
          onRetry={refetch}
        />
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
