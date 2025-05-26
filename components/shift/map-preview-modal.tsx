import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Circle, LatLng } from "react-native-maps";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import CustomButton from "../shared/custom-button";
import CustomBackdrop from "../ui/custom-backdrop";
import { THEME } from "@/constants/theme";
import Text from "../shared/text";

interface Props {
  visible: boolean;
  onClose: () => void;
  staffLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number; // optional accuracy in meters
  };
  clientLocation: { latitude: number; longitude: number };
  distance: number;
  threshold?: number;
  lightweight?: boolean; // ⬅️ enables simplified UI
}

const MapPreviewBottomSheet = ({
  visible,
  onClose,
  staffLocation,
  clientLocation,
  distance,
  threshold = 100,
  lightweight = false,
}: Props) => {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isInRange = distance <= threshold;

  const isValidCoords =
    staffLocation?.latitude &&
    staffLocation?.longitude &&
    clientLocation?.latitude &&
    clientLocation?.longitude;

  const coordinates: LatLng[] = useMemo(
    () => [clientLocation, staffLocation],
    [clientLocation, staffLocation]
  );

  useEffect(() => {
    if (visible && isValidCoords) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={["60%"]}
      index={0}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
      onDismiss={onClose}
      backdropComponent={(props) => <CustomBackdrop {...props} />}
    >
      <BottomSheetView style={styles.content}>
        {isValidCoords ? (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: clientLocation.latitude,
                longitude: clientLocation.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              onMapReady={() => {
                mapRef.current?.fitToCoordinates(
                  [staffLocation, clientLocation],
                  {
                    edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
                    animated: true,
                  }
                );
              }}
            >
              <Marker
                coordinate={staffLocation}
                title="You"
                pinColor={THEME.colors.primary}
              />
              <Marker coordinate={clientLocation} title="Client" />
              <Circle
                center={clientLocation}
                radius={threshold}
                strokeColor="rgba(0,0,255,0.5)"
                fillColor="rgba(0,0,255,0.1)"
              />
            </MapView>

            <View style={styles.feedbackContainer}>
              <Text style={[styles.distanceLabel]}>Distance to client:</Text>
              <Text
                weight="bold"
                style={[
                  styles.distanceValue,
                  { color: isInRange ? "#16a34a" : "#dc2626" }, // green or red
                ]}
              >
                {Math.round(distance)} meters
              </Text>

              <Text
                weight="semiBold"
                style={[
                  styles.feedbackMessage,
                  { color: isInRange ? "#16a34a" : "#dc2626" },
                ]}
              >
                {isInRange
                  ? "✅ You're within the required range to clock in"
                  : "⚠️ You're currently outside the clock-in zone"}
              </Text>
            </View>

            {!lightweight && (
              <>
                {staffLocation?.accuracy && (
                  <Text style={styles.accuracyText}>
                    GPS Accuracy: ±{Math.round(staffLocation.accuracy)} meters
                  </Text>
                )}

                {/* <Text style={styles.statusText}>
                  {isInRange
                    ? "You're within the clock-in range"
                    : "You're too far from the client location"}
                </Text> */}

                <CustomButton title="Close" onPress={onClose} />
              </>
            )}
          </>
        ) : (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.statusText}>Loading map...</Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default MapPreviewBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  indicator: {
    backgroundColor: "#ccc",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flex: 1,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  accuracyText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 4,
  },
  statusText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginVertical: 10,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackContainer: {
    marginTop: 16,
    marginBottom: 12,
    alignItems: "center",
  },

  distanceLabel: {
    fontSize: 14,
    color: "#6b7280", // gray-500
    marginBottom: 2,
  },

  distanceValue: {
    fontSize: 20,
  },

  feedbackMessage: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
