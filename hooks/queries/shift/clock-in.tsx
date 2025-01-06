import { useState } from "react";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { ShiftRosterService } from "@/services/shift";
import { showMessage } from "react-native-flash-message";
import { isAxiosError } from "axios";

interface StaffLocationProps {
  latitude: number;
  longitude: number;
}
const useClockIn = (
  userId: number,
  shiftRosterId: number,
  clientLat: number,
  clientLng: number
) => {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [distanceCheckLoading, setDistanceCheckLoading] = useState(false);

  // Get the current location of the staff
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  // Check if the staff can clock in based on their location
  const canClockIn = (
    staffLocation: StaffLocationProps,
    thresholdDistance = 1000
  ) => {
    // Set thresholdDistance to 1000 meters (1 km)
    if (!clientLat || !clientLng || clientLat === 0 || clientLng === 0) {
      Alert.alert(
        "Clock In Failed",
        "Unable to read client location. Kindly contact admin to update client address."
      );
      return { success: false, message: "Client location unavailable" }; // Include message
    }

    const distance = getDistance(
      { latitude: staffLocation.latitude, longitude: staffLocation.longitude },
      { latitude: clientLat, longitude: clientLng }
    );

    if (distance > thresholdDistance) {
      return {
        success: false,
        message: `You are currently too far from the client’s location. Please move closer (within approximately 1 kilometer) and try clocking in again.`,
        distance,
      }; // Notify about the distance
    }

    return { success: true, distance }; // Return success with distance information
  };

  // Use mutation to handle the clock-in process
  const { mutate: clockIn, isPending: clockInPending } = useMutation({
    mutationFn: async (staffLocation: StaffLocationProps) => {
      return ShiftRosterService.clockIn(
        userId,
        shiftRosterId,
        staffLocation.latitude,
        staffLocation.longitude
      ); // Ensure this API call works
    },

    onSuccess: () => {
      showMessage({
        message: "You’ve clocked in and are ready to go",
        description: "Have a productive shift!",
        type: "success",
      });

      setModalVisible(true);
      const queriesToInvalidate = [
        ["shift", { id: shiftRosterId }],
        ["shifts"],
      ];
      queriesToInvalidate.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: query })
      );
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

  // Function to initiate the clock-in process
  const handleClock = async () => {
    setDistanceCheckLoading(true); // Start distance check loading state
    const staffLocation = await getCurrentLocation();

    if (!staffLocation) {
      setDistanceCheckLoading(false); // Stop loading if location is not available
      return;
    }

    const checkResult = canClockIn(staffLocation);

    if (!checkResult.success) {
      setDistanceCheckLoading(false); // Stop loading if clock-in is not allowed
      Alert.alert("Clock In Error", checkResult.message);
      return; // Return early if cannot clock in
    }

    setDistanceCheckLoading(false); // Stop distance check loading state
    clockIn(staffLocation); // Proceed with the clock-in mutation
  };

  return {
    handleClock,
    modalVisible,
    setModalVisible,
    clockInPending,
    distanceCheckLoading, // Expose distance check loading state
  };
};

export default useClockIn;
