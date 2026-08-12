import { useState } from "react";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { ShiftRosterService } from "@/services/shift";
import { showMessage } from "react-native-flash-message";
import { isAxiosError } from "axios";
import {
  ATTENDANCE_GEOFENCE_RADIUS_METERS,
  AttendanceLocation,
} from "@/constants/attendance";

type ClockInCheckResult =
  | { success: true; distance: number }
  | {
      success: false;
      errorType: "NO_CLIENT_LOCATION" | "OUT_OF_RANGE";
      distance?: number;
      message: string;
    };

const useClockIn = (
  userId: string,
  shiftRosterId: number,
  clientLat: number,
  clientLng: number
) => {
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [distanceCheckLoading, setDistanceCheckLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [staffLocation, setStaffLocation] = useState<AttendanceLocation | null>(
    null
  );
  const [lastDistance, setLastDistance] = useState<number | null>(null);

  const getCurrentLocation = async (): Promise<AttendanceLocation | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showMessage({
          message: "Location Access Denied",
          description:
            "We need location access to clock you in. Please enable it in settings.",
          type: "danger",
        });
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
      };
    } catch (error) {
      showMessage({
        message: "Unable to fetch location",
        description: "Please ensure your GPS is enabled.",
        type: "danger",
      });
      return null;
    }
  };

  const canClockIn = (
    staffLocation: AttendanceLocation,
    thresholdDistance = ATTENDANCE_GEOFENCE_RADIUS_METERS
  ): ClockInCheckResult => {
    if (!clientLat || !clientLng || clientLat === 0 || clientLng === 0) {
      return {
        success: false,
        errorType: "NO_CLIENT_LOCATION",
        message:
          "We couldn't retrieve the client’s location. Please contact your admin to update the client’s address.",
      };
    }

    const distance = getDistance(
      { latitude: staffLocation.latitude, longitude: staffLocation.longitude },
      { latitude: clientLat, longitude: clientLng }
    );

    if (distance > thresholdDistance) {
      return {
        success: false,
        errorType: "OUT_OF_RANGE",
        distance,
        message: `You're currently ${distance} meters away from the client location. You need to be within ${thresholdDistance} meters to clock in.`,
      };
    }

    return { success: true, distance };
  };

  const { mutate: clockIn, isPending: clockInPending } = useMutation({
    mutationFn: async ({
      location,
      exceptionReason,
    }: {
      location: AttendanceLocation;
      exceptionReason?: string;
    }) => {
      return ShiftRosterService.clockIn(
        userId,
        shiftRosterId,
        location.latitude,
        location.longitude,
        {
          accuracy: location.accuracy,
          exceptionReason,
        }
      );
    },
    onSuccess: () => {
      setShowMapModal(false);
      setModalVisible(true);
      return queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        showMessage({
          message: error.response?.data?.message || "An error occurred",
          description: error.response?.data?.title,
          type: "danger",
        });
      }
    },
  });

  const handleClock = async () => {
    setDistanceCheckLoading(true);

    const location = await getCurrentLocation();
    if (!location) {
      setDistanceCheckLoading(false);
      return;
    }

    setStaffLocation(location);

    const checkResult = canClockIn(location);
    setLastDistance(checkResult.distance ?? null);

    if (!checkResult.success) {
      setDistanceCheckLoading(false);

      if (checkResult.errorType === "NO_CLIENT_LOCATION") {
        Alert.alert("Clock-In Failed", checkResult.message);
      } else if (checkResult.errorType === "OUT_OF_RANGE") {
        Alert.alert("Too Far to Clock In", checkResult.message, [
          { text: "Close" },
          { text: "View Map", onPress: () => setShowMapModal(true) },
        ]);
      }

      return;
    }

    // All checks passed
    clockIn({ location });
    setDistanceCheckLoading(false);
  };

  const submitException = (reason: string) => {
    const trimmedReason = reason.trim();
    if (!staffLocation || !trimmedReason) {
      showMessage({
        message: "Reason required",
        description:
          "Explain why you need to clock in outside the client location.",
        type: "danger",
      });
      return;
    }

    clockIn({ location: staffLocation, exceptionReason: trimmedReason });
  };

  return {
    handleClock,
    modalVisible,
    setModalVisible,
    clockInPending,
    distanceCheckLoading,
    showMapModal,
    setShowMapModal,
    staffLocation,
    lastDistance,
    submitException,
  };
};

export default useClockIn;
