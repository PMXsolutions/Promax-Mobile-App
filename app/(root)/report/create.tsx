import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { KeyboardAvoidingView, Platform } from "react-native";
import AddReportForm from "@/modules/report/add-report-form";
import { useLocalSearchParams } from "expo-router";

const ReportCreate = () => {
  const query = useLocalSearchParams();
  const rosterId = query.rosterId as unknown as string;
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
