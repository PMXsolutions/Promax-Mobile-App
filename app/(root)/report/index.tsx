import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { useLocalSearchParams } from "expo-router";
import HeaderWhite from "@/components/shared/header-no-bg";
import EditReportForm from "@/modules/report/edit-report-form";

const ReportDetail = () => {
  const query = useLocalSearchParams();

  const reportId = query.reportId as unknown as string;
  const rosterId = query.rosterId as unknown as string;

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

const styles = StyleSheet.create({});
