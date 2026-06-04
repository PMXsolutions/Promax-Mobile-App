import { StyleSheet, Text, View } from "react-native";
import React from "react";
import MapView, { Marker } from "react-native-maps";
import { ShiftRosterType } from "@/types/shift";
import { THEME } from "@/constants/theme";
import { mapStyle } from "@/constants/map-style";

const SmallMap = ({ shiftInfo }: { shiftInfo: ShiftRosterType }) => {
  // Recently updated: missing client coordinates should show the fallback map, not crash shift details.
  const profile = shiftInfo?.profile;
  const clientLatitude = profile?.latitude ?? 0;
  const clientLongitude = profile?.longitude ?? 0;
  const hasClientCoords = clientLatitude !== 0 && clientLongitude !== 0;
  const region =
    hasClientCoords
      ? {
          latitude: clientLatitude,
          longitude: clientLongitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }
      : undefined; // Use `undefined` instead of `null`

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: hasClientCoords ? clientLatitude : -33.86882,
        longitude: hasClientCoords ? clientLongitude : 151.20929,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }}
      customMapStyle={mapStyle}
      region={region} // Use the computed `region` value
    >
      {hasClientCoords && (
          <Marker
            coordinate={{
              latitude: clientLatitude,
              longitude: clientLongitude,
            }}
            title={profile?.fullName || "Client Location"}
            pinColor={THEME.colors.secondary}
          />
        )}
    </MapView>
  );
};

export default SmallMap;

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 200, // Adjust the height to ensure the map displays properly
    marginBottom: 20,
  },
});
