import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GoogleTextInput from "@/components/map/google-text-input";
import { useTripTracker } from "@/hooks/useTripTracker";
import MapViewTrip from "@/components/transport/MapViewTrip";
import TripControls from "@/components/transport/TripControls";
import TripSummary from "@/components/transport/TripSummary";
import { Coord } from "@/types/map";
import { isAxiosError } from "axios";
import { reportService } from "@/services/report";
import { showMessage } from "react-native-flash-message";
import { useLocalSearchParams } from "expo-router";
import ActionSheetModal from "@/components/shared/action-sheet-modal";

export default function TripScreen() {
  const query = useLocalSearchParams();

  const {
    tripState,
    route,
    stops,
    destination,
    setDestination,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    resetTrip,
    calculateDistance,
    getTripDuration,
    initialPosition,
    // tripStart,
    // tripEnd,
  } = useTripTracker();

  const id = query.id as unknown as string;

  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    subtitle?: string;
    options: {
      key: string;
      label: string;
      description?: string;
      icon?: string;
    }[];
    onSelect: (key: string) => void;
  }>({
    visible: false,
    title: "",
    options: [],
    onSelect: () => {},
  });

  const showConfirm = (
    title: string,
    subtitle: string,
    options: {
      key: string;
      label: string;
      icon?: string;
      description?: string;
    }[],
    onSelect: (key: string) => void
  ) => {
    setConfirmModal({
      visible: true,
      title,
      subtitle,
      options,
      onSelect: (key) => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        onSelect(key);
      },
    });
  };

  // Handle back button or app state changes during active trip
  useEffect(() => {
    if (tripState === "STARTED" || tripState === "PAUSED") {
      // Could add logic here to handle app backgrounding
      // or show a warning if user tries to navigate away
    }
  }, [tripState]);

  const handleDestinationSelect = (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    const coord: Coord = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    setDestination(coord);
  };

  const handleStart = async () => {
    if (!destination) {
      Alert.alert(
        "Destination Required",
        "Please select a destination before starting the trip.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!initialPosition) {
      Alert.alert(
        "Location Not Available",
        "Unable to get your current location. Please check location permissions.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await startTracking();
    } catch {
      Alert.alert("Error", "Failed to start trip tracking. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    showConfirm(
      "Pause Trip",
      "Are you sure you want to pause the trip?",
      [{ key: "pause", label: "Pause", icon: "⏸️" }],
      (key) => {
        if (key === "pause") pauseTracking();
      }
    );
  };

  const handleStopTrip = async () => {
    showConfirm(
      "Stop Trip",
      "Are you sure you want to stop the trip? This will end your current journey.",
      [{ key: "stop", label: "Stop Trip", icon: "🛑" }],
      (key) => {
        if (key === "stop") {
          stopTracking();
          setShowSummary(true);
        }
      }
    );
  };

  const handleSummarySubmit = async () => {
    setIsLoading(true);
    try {
      // Prepare trip data for API
      const tripData = {
        route,
        distance: calculateDistance(),
        duration: getTripDuration(),
        stops,
        destination,
        startTime: new Date(), // You might want to store this in the hook
        endTime: new Date(),
      };

      // console.log("Submit payload to backend:", tripData);
      const data = await reportService.fetchStaffKm(
        Number(id),
        0,
        tripData.distance
      );
      showMessage({
        message: data.message,
        type: "success",
      });
      // TODO: Replace with actual API call
      // await submitTripToAPI(tripData);
      // Reset trip state after successful submission
      resetTrip();
      setShowSummary(false);

      Alert.alert("Trip Saved", "Your trip has been saved successfully!", [
        { text: "OK" },
      ]);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showMessage({
          message: error.response?.data?.message,
          type: "danger",
        });
      } else {
        Alert.alert("Error", "Failed to save trip. Please try again.", [
          { text: "OK" },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummaryCancel = () => {
    Alert.alert(
      "Discard Trip",
      "Are you sure you want to discard this trip? This action cannot be undone.",
      [
        { text: "Keep Trip", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            resetTrip();
            setShowSummary(false);
          },
        },
      ]
    );
  };

  // Show summary screen
  if (showSummary) {
    return (
      <TripSummary
        route={route}
        distance={calculateDistance()}
        duration={getTripDuration()}
        stops={stops}
        destination={destination}
        isLoading={isLoading}
        onSubmit={handleSummarySubmit}
        onCancel={handleSummaryCancel}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GoogleTextInput
        icon="map-pin"
        handlePress={handleDestinationSelect}
        containerStyle={[styles.input, { top: insets.top + 10 }]}
      />

      {/* Map */}
      <MapViewTrip
        initialPosition={initialPosition}
        route={route}
        destination={destination}
        setDestination={setDestination}
      />

      {/* Trip Controls */}
      <TripControls
        state={tripState}
        // distance={calculateDistance()}
        // duration={getTripDuration()}
        // isLoading={isLoading}
        onStart={handleStart}
        onPause={handlePause}
        onResume={resumeTracking}
        onStop={handleStopTrip}
      />

      {/* Current trip info overlay - optional */}
      {(tripState === "STARTED" || tripState === "PAUSED") && (
        <View style={[styles.tripInfo, { top: insets.top + 70 }]}>
          {/* You could add real-time trip info here */}
        </View>
      )}
      <ActionSheetModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        subtitle={confirmModal.subtitle}
        options={confirmModal.options}
        onSelect={confirmModal.onSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    position: "absolute",
    width: "90%",
    zIndex: 1000,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tripInfo: {
    position: "absolute",
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
