import { Animated, StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import { shiftQuery } from "@/hooks/queries/shift";
import Header from "@/components/shared/header";
import { getActivityDetailStatus } from "@/helpers/shift-service";
import MiniLoader from "@/components/shared/mini-loader";
import PendingShift from "@/components/shift/banner/pending-shift";
import BeautifulCalendarAgenda from "@/components/shift/beatiful-shift";
import { AgendaProps } from "@/types/shift";
import ErrorState from "@/components/shared/error-state";

const Activity = () => {
  const { staff, user } = useAuthStore();
  const {
    data,
    isLoading,
    isError: error,
    refetch,
    isRefetching,
  } = shiftQuery.useShiftRoster(staff?.staffId!);
  const [now, setNow] = useState(new Date());
  const shiftData = Array.isArray(data) ? data : [];
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  const onRefresh = async () => {
    await refetch();
  };
  const filteredShifts = shiftData?.filter(
    (activity) =>
      activity.status !== "Cancelled" &&
      getActivityDetailStatus(activity, now) === "Present" &&
      !activity?.isShiftReportSigned
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const opacityTitle = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 40],
    extrapolate: "clamp",
  });
  // if (isLoading) {
  //   return <Loader name="2-curves" color={THEME.colors.secondary} />;
  // }

  const agendaShifts: AgendaProps[] = useMemo(() => {
    // Recently updated: tolerate partial roster rows from the API while preserving visible shift data.
    return (shiftData || []).map((shift) => ({
      shiftRosterId: shift.shiftRosterId,
      staff: shift.staff?.fullName ?? "",
      staffFirstName: shift.staff?.firstName ?? "",
      staffLastName: shift.staff?.middleName ?? "",
      staffImage: shift.staff?.imageUrl ?? "",
      client: shift.clients ?? "",
      activities: shift.activities ?? "",
      dateFrom: new Date(shift.dateFrom),
      dateTo: new Date(shift.dateTo),
      status: shift.status,
      isEnded: shift.isEnded,
      attendance: shift.attendance,
      image: shift.profile?.imageUrl ?? "",
    }));
  }, [shiftData]);

  return (
    <ScreenWrapper
      statusBgColor={THEME.colors.brand}
      bgColor={THEME.colors.brand}
      barStyle="light-content"
    >
      <MiniLoader visible={isLoading} title="Loading Shifts..." />
      <View
        style={[
          // styles.header,
          { backgroundColor: THEME.colors.brand, paddingBottom: 10 },
        ]}
      >
        <Header
          name={`Welcome, ${staff?.firstName}`}
          image={staff?.imageUrl!}
          role={user?.role!}
          opacityTitle={opacityTitle}
          translateTitle={translateTitle}
        />
        {/* <SearchBar openFilterModal={openFilterModal} /> */}
      </View>
      {filteredShifts.length > 0 && (
        <PendingShift num={filteredShifts.length} />
      )}
      <View style={styles.container}>
        {error && (
          <ErrorState
            message="Unable to load shift."
            onRetry={onRefresh}
            icon="file-alert-outline" // Or any icon you want
          />
        )}
        <BeautifulCalendarAgenda
          shiftData={agendaShifts}
          isRefetching={isRefetching}
          onRefresh={onRefresh}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
});
