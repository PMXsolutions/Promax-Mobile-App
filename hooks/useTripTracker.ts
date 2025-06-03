import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { Coord } from "@/types/map";
import { router } from "expo-router";

export function useTripTracker() {
  const [tripState, setTripState] = useState<
    "IDLE" | "STARTED" | "PAUSED" | "STOPPED"
  >("IDLE");
  const [route, setRoute] = useState<Coord[]>([]);
  const [destination, setDestination] = useState<Coord | null>(null);
  const [stops, setStops] = useState<Coord[]>([]);
  const watchId = useRef<Location.LocationSubscription | null>(null);
  const tripStart = useRef<Date | null>(null);
  const [initialPosition, setInitialPosition] = useState<Coord | null>(null);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (watchId.current) {
        watchId.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const position = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setInitialPosition(position);
        // Add initial position to route if trip is already started
        if (tripState === "STARTED") {
          setRoute((prev) => [position]);
        }
      } catch (error) {
        console.error("Error getting initial position:", error);
      }
    })();
  }, []);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Location permission not granted");
      return;
    }

    // Stop any existing watcher first
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }

    tripStart.current = new Date();
    setTripState("STARTED");

    try {
      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, // meters
          timeInterval: 3000, // 3 seconds
        },
        (location) => {
          const newCoord = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setRoute((prev) => {
            // Avoid duplicate coordinates that are too close
            if (prev.length > 0) {
              const lastCoord = prev[prev.length - 1];
              const distance = getDistance(lastCoord, newCoord);
              if (distance < 5) {
                // Less than 5 meters, skip
                return prev;
              }
            }
            return [...prev, newCoord];
          });
        }
      );

      watchId.current = watcher;
    } catch (error) {
      console.error("Error starting location tracking:", error);
      setTripState("IDLE");
    }
  };

  const pauseTracking = () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;

      // Add current position as a stop if route exists
      if (route.length > 0) {
        setStops((prev) => [...prev, route[route.length - 1]]);
      }
      setTripState("PAUSED");
    }
  };

  const resumeTracking = async () => {
    setTripState("STARTED");
    await startTracking();
  };

  const stopTracking = () => {
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    setTripState("STOPPED");
  };

  const resetTrip = () => {
    stopTracking();
    setRoute([]);
    setStops([]);
    setDestination(null);
    tripStart.current = null;
    setTripState("IDLE");
    router.back();
  };

  const calculateDistance = (): number => {
    if (route.length < 2) return 0;

    let totalMeters = 0;
    for (let i = 1; i < route.length; i++) {
      totalMeters += getDistance(route[i - 1], route[i]);
    }
    return totalMeters / 1000; // Convert to kilometers
  };

  const getTripDuration = (): number => {
    if (!tripStart.current) return 0;
    const now = tripState === "STOPPED" ? new Date() : new Date();
    return Math.floor((now.getTime() - tripStart.current.getTime()) / 1000);
  };

  const getCurrentSpeed = (): number => {
    // This would require storing timestamp with each coordinate
    // For now, return 0 or calculate based on last few points
    return 0;
  };

  return {
    tripState,
    route,
    stops,
    destination,
    initialPosition,
    setDestination,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    resetTrip,
    calculateDistance,
    getTripDuration,
    getCurrentSpeed,
  };
}
