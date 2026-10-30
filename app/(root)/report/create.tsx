import React, { useEffect, useState } from "react";
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
import ErrorState from "@/components/shared/error-state";

const ReportCreate = () => {
  const query = useLocalSearchParams();
  const { user, staff, isAuthenticated, token } = useAuthStore();
  const [formOpen, setFormOpen] = useState(false);
  const rosterId = query.rosterId as unknown as string;
  const staffId = Number(staff?.staffId);
  const sessionOpen =
    isAuthenticated &&
    Boolean(token) &&
    Number.isFinite(staffId) &&
    staffId > 0;
  const rosterQuery = shiftQuery.useShiftRoster(sessionOpen ? staffId : 0);
  const listed = shiftListedForSession(rosterQuery.data, Number(rosterId), {
    staffId: staff?.staffId,
    companyId: user?.companyId,
  });

  useEffect(() => {
    if (sessionOpen && listed && !rosterQuery.isLoading && !rosterQuery.isError) {
      setFormOpen(true);
    }
  }, [sessionOpen, listed, rosterQuery.isLoading, rosterQuery.isError]);

  if (!sessionOpen && !formOpen) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Add Shift Report"} />
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
        <HeaderWhite name={"Add Shift Report"} />
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
      {!sessionOpen && (
        <View style={{ padding: 24 }}>
          <Text>
            Your sign-in has ended. The typed report is still on this screen and was not sent.
          </Text>
        </View>
      )}
      <AddReportForm rosterId={rosterId} />
    </ScreenWrapper>
  );
};

export default ReportCreate;
