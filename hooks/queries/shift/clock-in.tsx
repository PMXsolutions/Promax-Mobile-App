import { useState } from "react";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { ShiftRosterService } from "@/services/shift";
import { showMessage } from "react-native-flash-message";
import { isAxiosError } from "axios";

type ClockInCheckResult =
  | { success: true; distance: number }
  | {
      success: false;
      errorType: "NO_CLIENT_LOCATION" | "OUT_OF_RANGE";
      distance?: number;
      message: string;
    };

interface StaffLocationProps {
  latitude: number;
  longitude: number;
}

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
  const [staffLocation, setStaffLocation] = useState<StaffLocationProps | null>(
    null
  );
  const [lastDistance, setLastDistance] = useState<number | null>(null);

  const getCurrentLocation = async (): Promise<StaffLocationProps | null> => {
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
    staffLocation: StaffLocationProps,
    thresholdDistance = 1000
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
    mutationFn: async (staffLocation: StaffLocationProps) => {
      return ShiftRosterService.clockIn(
        userId,
        shiftRosterId,
        staffLocation.latitude,
        staffLocation.longitude
      );
    },
    onSuccess: ({ data }) => {
      setModalVisible(true);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["shifts"] }),
        queryClient.invalidateQueries({
          queryKey: ["shifts", "detail", { id: shiftRosterId }],
        }),
      ]);
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
    onSettled: () => {
      setDistanceCheckLoading(false);
    },
  });

  const handleClock = async () => {
    // Recently updated: keep GPS checks and the clock-in mutation as one locked action.
    if (clockInPending || distanceCheckLoading) return;

    if (!userId || !shiftRosterId) {
      showMessage({
        message: "Unable to clock in. Please refresh this shift and try again.",
        type: "danger",
      });
      return;
    }

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
    clockIn(location);
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
  };
};

export default useClockIn;
