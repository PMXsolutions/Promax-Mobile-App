import { useState } from "react";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { ShiftRosterService } from "@/services/shift";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { showMessage } from "react-native-flash-message";
import {
  ATTENDANCE_GEOFENCE_RADIUS_METERS,
  AttendanceLocation,
} from "@/constants/attendance";

export const useClockOut = (
  user: string,
  shiftRosterId: number,
  clientLat: number,
  clientLng: number
) => {
  const queryClient = useQueryClient();
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [staffLocation, setStaffLocation] =
    useState<AttendanceLocation | null>(null);
  const [lastDistance, setLastDistance] = useState<number | null>(null);

  const getCurrentLocation = async (): Promise<AttendanceLocation | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showMessage({
          message: "Location Access Denied",
          description:
            "We need location access to clock you out. Please enable it in settings.",
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
    } catch {
      showMessage({
        message: "Unable to fetch location",
        description: "Please ensure your GPS is enabled.",
        type: "danger",
      });
      return null;
    }
  };

  const mutation = useMutation({
    mutationFn: async ({
      location,
      exceptionReason,
    }: {
      location: AttendanceLocation;
      exceptionReason?: string;
    }) =>
      ShiftRosterService.clockOut(
        user,
        shiftRosterId,
        location.latitude,
        location.longitude,
        {
          accuracy: location.accuracy,
          exceptionReason,
        }
      ),
    onSuccess: ({ data }) => {
      setShowMapModal(false);
      showMessage({
        message: data.message,
        description: "Well done!",
        type: "success",
      });
      return queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (error, variables) => {
      if (isAxiosError(error)) {
        const distance = Number(error.response?.data?.distanceMeters);
        const exceptionEligibleCodes = [
          "outside_radius",
          "poor_accuracy",
        ];
        if (
          exceptionEligibleCodes.includes(error.response?.data?.code) &&
          Number.isFinite(distance)
        ) {
          setStaffLocation(variables.location);
          setLastDistance(distance);
          setShowMapModal(true);
        }
        showMessage({
          message: error.response?.data?.message || "An error occurred",
          description: error.response?.data?.title,
          type: "danger",
        });
      }
    },
  });

  const handleClockOut = async () => {
    setLocationLoading(true);
    const location = await getCurrentLocation();
    setLocationLoading(false);
    if (!location) return;

    setStaffLocation(location);
    const hasClientLocation =
      Number.isFinite(clientLat) &&
      Number.isFinite(clientLng) &&
      clientLat !== 0 &&
      clientLng !== 0;

    if (hasClientLocation) {
      const distance = getDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: clientLat, longitude: clientLng }
      );
      setLastDistance(distance);
      if (distance > ATTENDANCE_GEOFENCE_RADIUS_METERS) {
        setShowMapModal(true);
        return;
      }
    }

    mutation.mutate({ location });
  };

  const submitException = (reason: string) => {
    const trimmedReason = reason.trim();
    if (!staffLocation || !trimmedReason) {
      showMessage({
        message: "Reason required",
        description:
          "Explain why you need to clock out outside the client location.",
        type: "danger",
      });
      return;
    }
    mutation.mutate({ location: staffLocation, exceptionReason: trimmedReason });
  };

  return {
    handleClockOut,
    clockOutPending: mutation.isPending,
    locationLoading,
    showMapModal,
    setShowMapModal,
    staffLocation,
    lastDistance,
    submitException,
  };
};
