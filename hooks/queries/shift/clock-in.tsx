import { useState } from "react";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { ShiftRosterService } from "@/services/shift";
import { showMessage } from "react-native-flash-message";
import { attendanceErrorMessage } from "@/libs/attendance-error";
import { CLOCK_IN_RADIUS_METERS, canStartClockAttempt, geofenceDecision, hasClientCoordinates } from "@/libs/geofence";

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
  const [blockerMessage, setBlockerMessage] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<StaffLocationProps | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        const message =
          "Location access was denied. Clock-in stays blocked until location is allowed. The 1000 metre check was not skipped.";
        setBlockerMessage(message);
        showMessage({
          message: "Location Access Denied",
          description: message,
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
      const message =
        "Your location could not be read. Clock-in stays blocked. Enable GPS and try again.";
      setBlockerMessage(message);
      showMessage({
        message: "Unable to fetch location",
        description: message,
        type: "danger",
      });
      return null;
    }
  };

  const canClockIn = (
    staffLocation: StaffLocationProps,
    thresholdDistance = CLOCK_IN_RADIUS_METERS
  ): ClockInCheckResult => {
    if (!hasClientCoordinates(clientLat, clientLng)) {
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

    if (geofenceDecision(distance, thresholdDistance) === "outside") {
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
      return queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (error) => {
      const message = attendanceErrorMessage(error, "clock in");
      setBlockerMessage(message);
      showMessage({
        message,
        type: "danger",
      });
    },
  });

  const handleClock = async () => {
    if (
      !canStartClockAttempt({
        pending: clockInPending,
        checking: distanceCheckLoading,
      })
    ) {
      return;
    }

    setDistanceCheckLoading(true);

    setBlockerMessage(null);
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

    clockIn(location, {
      onSettled: () => setDistanceCheckLoading(false),
    });
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
    blockerMessage,
  };
};

export default useClockIn;
