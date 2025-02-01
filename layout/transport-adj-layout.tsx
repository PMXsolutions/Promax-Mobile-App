import { mapStyle } from "@/constants/map-style";
import { THEME } from "@/constants/theme";
import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { MapViewProps, Marker } from "react-native-maps";

interface TransportLayoutProps {
  children: React.ReactNode;
  currentLocation: { latitude: number; longitude: number } | null;
  mapRef?: React.RefObject<MapViewProps>;
}

const TransportLayout: React.FC<TransportLayoutProps> = ({
  children,
  currentLocation,
  mapRef,
}) => {
  return (
    <View style={styles.container}>
      {/* Map Section */}
      <MapView
        style={styles.map}
        ref={mapRef as any}
        customMapStyle={mapStyle}
        loadingEnabled={true}
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#eeeeee"
        moveOnMarkerPress={false}
        showsUserLocation={true}
        showsCompass={true}
        showsPointsOfInterest={false}
        //  provider="google"
        initialRegion={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : undefined
        }
        region={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : undefined
        }
        mapType="standard"
      >
        {currentLocation && (
          <Marker coordinate={currentLocation} pinColor={THEME.colors.brand} />
        )}
      </MapView>

      {/* Content Section */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  content: { flex: 1, backgroundColor: "#fff", padding: 16 },
});

export default TransportLayout;
