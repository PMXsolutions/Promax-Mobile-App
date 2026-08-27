import React, { useEffect, useRef, useState } from "react";
import MapView, { AnimatedRegion, Marker, Polyline } from "react-native-maps";
import { View, StyleSheet , Image } from "react-native";
import { Coord } from "@/types/map";

export default function MapViewTrip({
  route,
  destination,
  setDestination,
  initialPosition,
}: {
  route: Coord[];
  destination: Coord | null;
  setDestination: (coord: Coord) => void;
  initialPosition: Coord | null;
}) {
  const mapRef = useRef<MapView>(null);
  const carPosition = useRef<AnimatedRegion | null>(null);
  const prevCoord = useRef<Coord | null>(null);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if (initialPosition && !carPosition.current) {
      carPosition.current = new AnimatedRegion({
        ...initialPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [initialPosition]);

  useEffect(() => {
    if (initialPosition && mapRef.current) {
      mapRef.current.animateToRegion({
        ...initialPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [initialPosition]);

  useEffect(() => {
    if (route.length > 1) {
      const newCoord = route[route.length - 1];
      const lastCoord = prevCoord.current;

      // Animate position - FIXED: Use setValue for immediate update or alternative timing approach
      if (carPosition.current) {
        // Option 1: Direct setValue (immediate update)
        carPosition.current.setValue({
          latitude: newCoord.latitude,
          longitude: newCoord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Option 2: If you need smooth animation, use this approach instead:
        // carPosition.current.timing({
        //   toValue: 1,
        //   duration: 1000,
        //   useNativeDriver: false,
        // }).start(() => {
        //   carPosition.current?.setValue({
        //     latitude: newCoord.latitude,
        //     longitude: newCoord.longitude,
        //     latitudeDelta: 0.01,
        //     longitudeDelta: 0.01,
        //   });
        // });
      }

      // Animate camera
      mapRef.current?.animateToRegion({
        ...newCoord,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Calculate heading
      if (lastCoord) {
        const newHeading = calculateHeading(lastCoord, newCoord);
        setHeading(newHeading);
      }

      prevCoord.current = newCoord;
    }
  }, [route]);

  const calculateHeading = (from: Coord, to: Coord): number => {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        initialRegion={
          initialPosition
            ? {
                ...initialPosition,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          if (!destination) setDestination({ latitude, longitude });
        }}
      >
        {route.length > 1 && <Polyline coordinates={route} strokeWidth={4} />}

        {route.length > 0 && carPosition.current && (
          <Marker.Animated
            coordinate={carPosition.current as unknown as any}
            flat
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={heading}
          >
            <Image
              source={require("../../assets/images/car-icon.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </Marker.Animated>
        )}

        {destination && <Marker coordinate={destination} pinColor="green" />}

        {destination && route.length > 0 && (
          <Polyline
            coordinates={[route[route.length - 1], destination]}
            strokeColor="green"
            strokeWidth={2}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>
    </View>
  );
}
