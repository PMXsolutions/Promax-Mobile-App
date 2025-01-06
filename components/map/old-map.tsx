import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Alert, Pressable, Image } from "react-native";
import MapView, {
  Marker,
  Polyline,
  MapViewProps,
  LatLng,
} from "react-native-maps";
import * as Location from "expo-location";
import { getDistance } from "geolib";
// import TripDetails from "../../components/Maps/TripDetails";
// import EndTrip from "../../components/Maps/EndTrip";
import Icon from "@expo/vector-icons/AntDesign";
import Text from "@/components/shared/text";
import GoBack from "@/components/go-back";
import { THEME } from "@/constants/theme";

type Destination = {
  lat: number;
  lng: number;
} | null;

type Stage = "selectDestination" | "tripDetails" | "endTrip";

const LocationTrackingScreen: React.FC = () => {
  const mapRef = useRef<MapViewProps>(null);

  const [latlng, setLatLng] = useState<LatLng>({
    latitude: -33.86882,
    longitude: 151.20929,
  });

  const [destination, setDestination] = useState<Destination>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");
  const [tracking, setTracking] = useState<boolean>(false);
  const [stage, setStage] = useState<Stage>("selectDestination");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const {
          coords: { latitude, longitude },
        } = await Location.getCurrentPositionAsync();
        setLatLng({ latitude, longitude });

        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        // console.log(address);

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

  const coordinates = destination
    ? [
        { latitude: latlng.latitude, longitude: latlng.longitude },
        { latitude: destination.lat, longitude: destination.lng },
      ]
    : [];

  useEffect(() => {
    if (destination) {
      (mapRef.current as any)?.fitToCoordinates(coordinates, {
        edgePadding: { top: 200, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [destination, latlng]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | undefined;
    if (tracking) {
      const startTracking = async () => {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            setLatLng({ latitude, longitude });
          }
        );
      };
      startTracking();
    }
    return () => {
      locationSubscription?.remove();
    };
  }, [tracking]);

  const onDestinationSelected = (destination: Destination) => {
    if (destination) {
      const distance = getDistance(
        { latitude: latlng.latitude, longitude: latlng.longitude },
        { latitude: destination.lat, longitude: destination.lng }
      );
      setDistance(distance);
      setDestination(destination);
      setStage("tripDetails");
    }
  };

  const onStartTrip = () => {
    setTracking(true);
    setStage("endTrip");
  };

  const onEndTrip = () => {
    setTracking(false);
    Alert.alert(
      "Trip Ended",
      `Total distance traveled: ${(distance! / 1000).toFixed(2)} km`,
      [
        {
          text: "OK",
        },
      ]
    );
    setStage("selectDestination");
  };
  const regional = latlng
    ? {
        latitude: latlng.latitude,
        longitude: latlng.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }
    : undefined; // Use `undefined` instead of `null`

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.map}>
        <View
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "#f5f4f5",
            zIndex: 20,
          }}
        >
          <GoBack />
        </View>
        <MapView
          style={{ flex: 1 }}
          ref={mapRef as any}
          initialRegion={regional}
          region={regional}
          mapType="standard"
        >
          <Marker
            coordinate={{
              latitude: latlng.latitude,
              longitude: latlng.longitude,
            }}
            title="My Location"
          >
            <Image
              source={require("../../assets/images/mapDot.png")}
              style={{ width: 30 }}
              resizeMode="cover"
            />
          </Marker>
          <Marker
            key="destination"
            coordinate={latlng}
            title="Destination"
            pinColor="red"
            // image={icons.pin}
          />
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.lat,
                longitude: destination.lng,
              }}
              pinColor={THEME.colors.secondary}
            />
          )}
          {destination && (
            <Polyline
              coordinates={coordinates}
              strokeColor={THEME.colors.brand}
              strokeWidth={1.5}
              lineDashPattern={[1, 5]}
            />
          )}
        </MapView>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoContent}>
          {stage === "selectDestination" && (
            <View
              style={{
                marginTop: 20,
                flex: 1,
                gap: 5,
                alignItems: "center",
              }}
            >
              <Pressable onPress={openModal} style={styles.destinationButton}>
                <Icon name="search1" size={20} />
                <Text weight="regular" size={"lg"}>
                  Search Destination...
                </Text>
              </Pressable>
            </View>
          )}
          {/* {stage === "tripDetails" && <TripDetails onStartTrip={onStartTrip} />}
          {stage === "endTrip" && (
            <EndTrip
              onEndTrip={onEndTrip}
              distance={distance}
              address={address}
            />
          )} */}
        </View>
      </View>
      {/* <MapModal
        closeModal={closeModal}
        modalVisible={modalVisible}
        onDestinationSelected={onDestinationSelected}
        setAdress={setAddress}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 0.6,
    position: "relative",
  },
  infoContainer: {
    flex: 0.4,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: THEME.colors.brand,
    marginTop: -20,
    paddingTop: 15,
  },
  infoContent: {
    flex: 1,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#fff",
    paddingTop: 20,
  },

  destinationButton: {
    height: 48,
    width: "100%",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    backgroundColor: THEME.colors.white,
    gap: 20,
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row",
  },
  mapImageContainer: {
    width: 90,
    height: 20,
    flex: 1,
  },
});

export default LocationTrackingScreen;
