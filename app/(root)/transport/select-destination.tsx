import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import TransportLayout from "@/layout/transport-adj-layout";
import GoogleTextInput from "@/components/map/google-text-input";
import { THEME } from "@/constants/theme";
import { MapViewProps } from "react-native-maps";

interface Props {
  navigation: any;
}

const DestinationScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = useRef<MapViewProps>(null);
  const [initialLocation, setInitialLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const {
          coords: { latitude, longitude },
        } = await Location.getCurrentPositionAsync();
        setInitialLocation({ latitude, longitude });

        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        console.log(address);

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

  //   const coordinates = destination
  //     ? [
  //         { latitude: latlng.latitude, longitude: latlng.longitude },
  //         { latitude: destination.lat, longitude: destination.lng },
  //       ]
  //     : [];

  //   useEffect(() => {
  //     if (destination) {
  //       (mapRef.current as any)?.fitToCoordinates(coordinates, {
  //         edgePadding: { top: 200, right: 50, bottom: 50, left: 50 },
  //         animated: true,
  //       });
  //     }
  //   }, [destination, latlng]);

  // Fetch staff's initial location
  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to continue."
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setInitialLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    fetchLocation();
  }, []);

  const handleNext = () => {
    if (!destination) {
      Alert.alert("Error", "Please select a destination.");
      return;
    }
    navigation.navigate("InstructionsScreen", { initialLocation, destination });
  };

  if (!initialLocation) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={THEME.colors.brand} />
      </View>
    );
  }

  return (
    <TransportLayout currentLocation={initialLocation} mapRef={mapRef}>
      <View style={styles.container}>
        <GoogleTextInput
          icon={"map"}
          containerStyle={{
            backgroundColor: "#f5f5f5",
          }}
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestination(location.address)}
        />
        <Button title="Next" onPress={handleNext} />
      </View>
    </TransportLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default DestinationScreen;
