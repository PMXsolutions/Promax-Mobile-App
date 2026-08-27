import { StyleSheet } from "react-native";
import React from "react";
import MapView, { Marker } from "react-native-maps";
import { ShiftRosterType } from "@/types/shift";
import { THEME } from "@/constants/theme";
import { mapStyle } from "@/constants/map-style";

const SmallMap = ({ shiftInfo }: { shiftInfo: ShiftRosterType }) => {
  const region =
    shiftInfo &&
    shiftInfo.profile.latitude !== 0 &&
    shiftInfo.profile.longitude !== 0
      ? {
          latitude: shiftInfo.profile.latitude,
          longitude: shiftInfo.profile.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }
      : undefined; // Use `undefined` instead of `null`

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude:
          shiftInfo?.profile?.latitude === 0
            ? -33.86882
            : shiftInfo?.profile?.latitude,
        longitude:
          shiftInfo?.profile?.longitude === 0
            ? 151.20929
            : shiftInfo?.profile?.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }}
      customMapStyle={mapStyle}
      region={region} // Use the computed `region` value
    >
      {shiftInfo &&
        shiftInfo.profile.latitude !== 0 &&
        shiftInfo.profile.longitude !== 0 && (
          <Marker
            coordinate={{
              latitude: shiftInfo.profile.latitude,
              longitude: shiftInfo.profile.longitude,
            }}
            title={shiftInfo.profile.fullName || "Client Location"}
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
