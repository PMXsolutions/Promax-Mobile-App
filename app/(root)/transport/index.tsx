import GoBack from "@/components/go-back";
import { mapStyle } from "@/constants/map-style";
import { THEME } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { MapViewProps, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import Loader from "@/components/shared/loader";
import DestinationScreen from "./select-destination";
import ReviewScreen from "./review";

const TransportLayout: React.FC = () => {
  const [step, setStep] = useState(1);
  const mapRef = useRef<MapViewProps>(null);
  const [initialLocation, setInitialLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const {
          coords: { latitude, longitude },
        } = await Location.getCurrentPositionAsync();

        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        setInitialLocation({
          latitude,
          longitude,
          address: `${address[0].formattedAddress || "Unknown"}`,
        });

        if (mapRef.current) {
          (mapRef.current as any).animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          });
        }
      }
    };
    fetchLocation();
  }, []);

  const coordinates = [];
  if (initialLocation) {
    coordinates.push({
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
    });
  }
  if (destination) {
    coordinates.push({
      latitude: destination.latitude,
      longitude: destination.longitude,
    });
  }
  if (!initialLocation) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Fetching your location.."
      />
    );
  }
  return (
    <View style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: 50,
          left: 10,
          backgroundColor: "#f5f4f5",
          zIndex: 20,
        }}
      >
        <GoBack />
      </View>
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
          initialLocation
            ? {
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : undefined
        }
        region={
          initialLocation
            ? {
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : undefined
        }
        mapType="standard"
      >
        {initialLocation && (
          <Marker coordinate={initialLocation} pinColor={THEME.colors.brand} />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            pinColor={THEME.colors.secondary}
          />
        )}
        {destination && coordinates.length > 1 && (
          <Polyline
            coordinates={coordinates}
            strokeColor={THEME.colors.brand}
            strokeWidth={3} // Increase stroke width for visibility
            lineDashPattern={[5, 10]}
          />
        )}
      </MapView>

      {/* Content Section */}
      <View style={styles.content}>
        {step === 1 && (
          <DestinationScreen
            destination={destination}
            setDestination={setDestination}
            setStep={setStep}
          />
        )}
        {step === 2 && (
          <ReviewScreen
            setStep={setStep}
            initialLocation={initialLocation}
            destination={destination}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  map: { flex: 1 },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -10,
  },
});

export default TransportLayout;
