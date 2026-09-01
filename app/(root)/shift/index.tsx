import { Button } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import TransportButton from "@/components/shift/transport-button";
import MiniLoader from "@/components/shared/mini-loader";
import ShiftMessage from "@/components/shift/shift-message";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomBackdrop from "@/components/ui/custom-backdrop";
import MapPreviewBottomSheet from "@/components/shift/map-preview-modal";

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
    lastDistance,
    setShowMapModal,
    showMapModal,
    staffLocation,
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

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets(); // for proper padding

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setModalVisible(false); // also reset original modal flag
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (modalVisible) {
        openModal();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [modalVisible]);

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

      {/* <Button title="Try me " onPress={openModal} /> */}
      <ShiftDetailContent shift={shift!} />

      {shift && (
        <ShiftAction
          clockIn={handleClock}
          // Recently updated: disable Clock In while GPS validation is still running.
          clockInPending={clockInPending || distanceCheckLoading}
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
      {staffLocation && (
        <MapPreviewBottomSheet
          visible={showMapModal}
          onClose={() => setShowMapModal(false)}
          staffLocation={staffLocation!}
          clientLocation={{
            latitude: shift?.profile?.latitude!,
            longitude: shift?.profile?.longitude!,
          }}
          distance={lastDistance ?? 0}
          lightweight={false}
        />
      )}

      <BottomSheetModal
        snapPoints={["50%"]}
        index={0}
        ref={bottomSheetModalRef}
        backdropComponent={(props) => <CustomBackdrop {...props} />}
        backgroundStyle={{
          borderRadius: 10,
          backgroundColor: THEME.colors.white,
        }}
        handleIndicatorStyle={{
          backgroundColor: THEME.colors.primary,
        }}
      >
        <BottomSheetView
          style={{ paddingBottom: insets.bottom + 30, paddingHorizontal: 20 }}
        >
          <ShiftMessage shift={shift!} closeModal={closeModal} />
        </BottomSheetView>
      </BottomSheetModal>
    </ScreenWrapper>
  );
};

export default ShiftDetail;
