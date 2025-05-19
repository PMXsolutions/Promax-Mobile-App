import { ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { shiftQuery } from "@/hooks/queries/shift";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import ShiftDetailContent from "@/modules/shift/shift-details";
import { getActivityDetailStatus } from "@/helpers/shift-service";
import ProgressBanner from "@/components/shift/banner/progress-banner";
import useClockIn from "@/hooks/queries/shift/clock-in";
import { useClockOut } from "@/hooks/queries/shift/clock-out";
import ShiftAction from "@/helpers/shift-action";
import useAuthStore from "@/store/use-auth-store";
import ShiftMessage from "@/components/shift/shift-message";
import TransportButton from "@/components/shift/transport-button";
import ModalPop from "@/components/shared/modal";
import MiniLoader from "@/components/shared/mini-loader";

const ShiftDetail = () => {
  const { user } = useAuthStore();
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;
  const clients = query.clients as unknown as string;
  const { data: shift, isLoading } = shiftQuery.useShiftDetail(Number(id));

  const {
    clockInPending,
    handleClock,
    modalVisible,
    setModalVisible,
    distanceCheckLoading,
  } = useClockIn(
    user?.userId as string,
    shift?.shiftRosterId!,
    shift?.profile?.latitude!,
    shift?.profile?.longitude!
  );
  const { mutate: clockOut, isPending: clockOutPending } = useClockOut(
    user?.userId as string,
    shift?.shiftRosterId!
  );

  const shiftActivities = shift?.activities.split(", ");
  // Live time tracking state
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  // const load = true;
  if (isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Shift.."
      />
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={clients} />
      <MiniLoader
        visible={distanceCheckLoading}
        title="Calculating your distance to client's location.."
      />
      {shift && getActivityDetailStatus(shift, now) === "Shift In progress" && (
        <ProgressBanner shiftId={shift.shiftRosterId} />
      )}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ShiftDetailContent shift={shift!} />
      </ScrollView>
      {shift && (
        <ShiftAction
          clockIn={handleClock}
          clockInPending={clockInPending}
          clockOut={clockOut}
          clockOutPending={clockOutPending}
          activity={shift!}
          now={now}
        />
      )}
      {/*  */}

      <>
        {shift &&
          // getActivityDetailStatus(shift, now) === "Present" &&
          // getActivityDetailStatus(shift, now) === "Absent" &&
          shiftActivities?.includes("Transport") && (
            <TransportButton shiftId={shift?.shiftRosterId!} />
          )}
      </>
      {/* <>{shift && <TransportButton shiftId={shift?.shiftRosterId!} />}</> */}
      <ModalPop
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        title={`Good Job, ${shift?.staff?.firstName}`}
      >
        <ShiftMessage
          shift={shift!}
          closeModal={() => setModalVisible(false)}
        />
      </ModalPop>
    </ScreenWrapper>
  );
};

export default ShiftDetail;

const styles = StyleSheet.create({
  content: {
    // rowGap: THEME.spacing.lg,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    // marginTop: 10,
  },
});
