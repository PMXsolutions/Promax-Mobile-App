import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet } from "react-native";
import MapView, {
  MapViewProps,
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { useLocationStore } from "@/store/use-location-store";
import { calculateRegion } from "@/libs/map";

import * as Location from "expo-location";
import { getDistance } from "geolib";
import { THEME } from "@/constants/theme";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

const Map = () => {
  const mapRef = useRef<MapViewProps>(null);
  const [tracking, setTracking] = useState<boolean>(false);

  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    setUserLocation,
  } = useLocationStore();

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

        setUserLocation({
          latitude,
          longitude,
          address: ``,
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

  const coordinates =
    userLatitude && userLongitude && destinationLatitude && destinationLongitude
      ? [
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: destinationLatitude, longitude: destinationLongitude },
        ]
      : [];

  useEffect(() => {
    if (destinationLatitude && destinationLongitude) {
      (mapRef.current as any)?.fitToCoordinates(coordinates, {
        edgePadding: { top: 200, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      ref={mapRef as any}
      style={styles.map}
      initialRegion={
        userLatitude && userLongitude
          ? {
              latitude: userLatitude,
              longitude: userLongitude,
              latitudeDelta: 0.012,
              longitudeDelta: 0.012,
            }
          : undefined
      }
      showsUserLocation={true}
    >
      {userLatitude && userLongitude && (
        <Marker
          coordinate={{
            latitude: userLatitude,
            longitude: userLongitude,
          }}
          title="My Location"
        >
          <Image
            source={require("../../assets/images/mapDot.png")}
            style={{ width: 30 }}
            resizeMode="cover"
          />
        </Marker>
      )}

      {destinationLatitude && destinationLongitude && (
        <Marker
          coordinate={{
            latitude: destinationLatitude,
            longitude: destinationLongitude,
          }}
          title="Destination"
          pinColor="red"
        />
      )}

      {coordinates.length > 0 && (
        <Polyline
          coordinates={coordinates}
          strokeColor={THEME.colors.primary}
          strokeWidth={1.5}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  errorText: {
    color: "red",
  },
  map: {
    width: "100%",
    height: "55%",
    // borderRadius: 16, // To mimic `rounded-2xl` style
  },
});

export default Map;
