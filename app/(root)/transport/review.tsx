import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { getDistance } from "geolib";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import CustomButton from "@/components/shared/custom-button";

const ReviewScreen = ({
  initialLocation,
  destination,
  setStep,
}: {
  initialLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  setStep: (value: React.SetStateAction<number>) => void;
}) => {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // Calculate distance when component mounts
  useEffect(() => {
    if (initialLocation && destination) {
      const dist =
        getDistance(
          {
            latitude: initialLocation.latitude,
            longitude: initialLocation.longitude,
          },
          { latitude: destination.latitude, longitude: destination.longitude }
        ) / 1000; // Convert meters to km

      if (dist > 50) {
        Alert.alert(
          "Error",
          "Selected location is too far. Stay within the city."
        );
        setDistanceKm(null); // Reset distance
        setStep(1); // Reset step
      } else {
        setDistanceKm(dist);
      }
    }
  }, [initialLocation, destination]);

  const saveToAPI = async () => {
    if (!initialLocation || !destination || distanceKm === null) {
      Alert.alert("Error", "Invalid data. Please select valid locations.");
      return;
    }

    const payload = {
      startLocation: initialLocation,
      destination,
      distanceKm,
    };

    try {
      let response = await fetch("https://your-api.com/save-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Success", "Location saved successfully!");
      } else {
        Alert.alert("Error", "Failed to save location.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Map View */}

      {/* Delivery Step Display */}
      <View style={styles.stepRow}>
        <Text size="lg" weight="bold" style={{ color: THEME.colors.grayBg }}>
          My Location:{" "}
        </Text>
        <Text size="lg" weight="bold">
          {initialLocation?.address}
        </Text>
      </View>
      <View style={styles.stepRow}>
        <Text size="lg" weight="bold" style={{ color: THEME.colors.grayBg }}>
          Destination:{" "}
        </Text>
        <Text size="lg" weight="bold">
          {destination?.address}
        </Text>
      </View>

      <View style={styles.stepRow}>
        <Text size="lg" weight="bold" style={{ color: THEME.colors.grayBg }}>
          Distance:{" "}
        </Text>
        <Text size="lg" weight="bold">
          {distanceKm !== null
            ? `${distanceKm.toFixed(2)} km`
            : "Calculating..."}
        </Text>
      </View>

      <CustomButton title="Save Km" onPress={saveToAPI} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: THEME.spacing.sm, rowGap: THEME.spacing.lg },
  map: { width: "100%", height: "50%" },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  grayDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: "gray",
    borderColor: THEME.colors.border,
  },
  greenDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "green",
    borderWidth: 2,
    borderColor: THEME.colors.border,
  },

  addressText: { fontSize: 16, flexShrink: 1 },
});

export default ReviewScreen;
