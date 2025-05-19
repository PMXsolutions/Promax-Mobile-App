import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { MaterialIcons } from "@expo/vector-icons"; // For the icons

type Coord = { latitude: number; longitude: number };
type Stopover = {
  location: Coord;
  distanceAtStop: number;
  //   time: string;
};

const TransportTracker = () => {
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [stopovers, setStopovers] = useState<Stopover[]>([]);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const prevLocationRef = useRef<Coord | null>(null);

  useEffect(() => {
    return () => {
      locationSubscription?.remove();
    };
  }, []);

  const startTrip = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission not granted");
      return;
    }

    setTracking(true);
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (loc) => {
        const newCoord = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        const prev = prevLocationRef.current;
        if (prev && !paused) {
          const dist = getDistance(prev, newCoord);
          setDistance((d) => d + dist);
        }

        prevLocationRef.current = newCoord;
      }
    );

    setLocationSubscription(sub);
  };

  const pauseTrip = () => {
    if (!paused && prevLocationRef.current) {
      //   const timestamp = moment().format("h:mm A");
      setStopovers((prev) => [
        ...prev,
        {
          location: prevLocationRef.current!,
          distanceAtStop: distance,
          //   time: timestamp,
        },
      ]);
    }
    setPaused(true);
  };

  const resumeTrip = () => {
    setPaused(false);
  };

  const endTrip = () => {
    locationSubscription?.remove();
    setTracking(false);
    setPaused(false);
    console.log("Stopovers:", stopovers);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.header}>🚘 Trip Tracker</Text>
          <Text
            style={[styles.badge, tracking ? styles.active : styles.inactive]}
          >
            {tracking ? (paused ? "Paused" : "Tracking") : "Not Started"}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Total Distance:</Text>
          <Text style={styles.value}>{(distance / 1000).toFixed(2)} km</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Stopovers:</Text>
          {stopovers.length === 0 ? (
            <Text style={styles.none}>None</Text>
          ) : (
            <FlatList
              data={stopovers}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.stopItem}>
                  <Text style={styles.stopTitle}>
                    Stop {index + 1} -{/* {item.time} */}
                  </Text>
                  <Text style={styles.stopText}>
                    Distance: {(item.distanceAtStop / 1000).toFixed(2)} km
                  </Text>
                  <Text style={styles.stopText}>
                    Coords: {item.location.latitude.toFixed(4)},{" "}
                    {item.location.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.buttonGroup}>
          {!tracking && (
            <TouchableOpacity style={styles.startButton} onPress={startTrip}>
              <MaterialIcons name="directions-car" size={30} color="#fff" />
              <Text style={styles.buttonText}>Start Trip</Text>
            </TouchableOpacity>
          )}
          {tracking && !paused && (
            <TouchableOpacity style={styles.pauseButton} onPress={pauseTrip}>
              <MaterialIcons name="pause" size={30} color="#fff" />
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
          )}
          {tracking && paused && (
            <TouchableOpacity style={styles.resumeButton} onPress={resumeTrip}>
              <MaterialIcons name="play-arrow" size={30} color="#fff" />
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
          )}
          {tracking && (
            <TouchableOpacity style={styles.stopButton} onPress={endTrip}>
              <MaterialIcons name="stop" size={30} color="#fff" />
              <Text style={styles.buttonText}>End Trip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default TransportTracker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F9FA",
  },
  headerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  active: {
    backgroundColor: "#28a745",
  },
  inactive: {
    backgroundColor: "#6c757d",
  },
  infoBox: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  none: {
    color: "#888",
  },
  stopItem: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  stopTitle: {
    fontWeight: "bold",
  },
  stopText: {
    fontSize: 13,
    color: "#555",
  },
  buttonGroup: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
  },
  startButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
    flexDirection: "column",
  },
  pauseButton: {
    backgroundColor: "#f44336",
    padding: 16,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
    flexDirection: "column",
  },
  resumeButton: {
    backgroundColor: "#ff9800",
    padding: 16,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
    flexDirection: "column",
  },
  stopButton: {
    backgroundColor: "#9e9e9e",
    padding: 16,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
    flexDirection: "column",
  },
  buttonText: {
    marginTop: 10,
    fontWeight: "600",
    color: "#fff",
  },
});
