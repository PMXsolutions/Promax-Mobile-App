import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GOOGLE_MAPS_API_KEY } from "@/constants/api-key";
import { generateStaticMapUrl } from "@/utils/generateStaticMap";
import ScreenWrapper from "../wrapper/screen-wrapper";
import { Coord } from "@/types/map";
import { THEME } from "@/constants/theme";

type TripSummaryProps = {
  route: Coord[];
  distance: number;
  duration?: number; // in seconds
  stops: Coord[];
  destination?: Coord | null;
  isLoading?: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
};

export default function TripSummary({
  route,
  distance,
  duration = 0,
  stops,
  destination,
  isLoading = false,
  onSubmit,
  onCancel,
}: TripSummaryProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const imageUrl = generateStaticMapUrl(route, GOOGLE_MAPS_API_KEY);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateAverageSpeed = (): number => {
    if (duration === 0) return 0;
    return distance / (duration / 3600); // km/h
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const showStopDetails = () => {
    if (stops.length === 0) return;

    Alert.alert(
      "Trip Stops",
      `You made ${stops.length} stop${
        stops.length > 1 ? "s" : ""
      } during your trip.\n\nStops help track your journey and can be useful for expense reporting or route optimization.`,
      [{ text: "OK" }]
    );
  };

  return (
    <ScreenWrapper barStyle="dark-content">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="flag" size={28} color="#4CAF50" />
          <Text style={styles.title}>Trip Complete!</Text>
          <Text style={styles.subtitle}>Here’s your journey summary</Text>
        </View>

        {/* Map Preview */}
        <View style={styles.mapContainer}>
          {imageLoading && !imageError && (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          )}

          {imageError ? (
            <View style={styles.mapError}>
              <MaterialIcons name="map" size={48} color="#ccc" />
              <Text style={styles.errorText}>Map preview unavailable</Text>
            </View>
          ) : (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.mapImage, imageLoading && styles.hidden]}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </View>

        {/* Trip Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="straighten" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="speed" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>
              {calculateAverageSpeed().toFixed(1)} km/h
            </Text>
            <Text style={styles.statLabel}>Avg Speed</Text>
          </View>
        </View>

        {/* Detailed Info */}
        <View style={styles.detailsContainer}>
          <Pressable
            style={styles.infoRow}
            onPress={showStopDetails}
            disabled={stops.length === 0}
          >
            <View style={styles.infoLeft}>
              <MaterialIcons name="place" size={20} color="#666" />
              <Text style={styles.infoLabel}>Stops Made</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{stops.length}</Text>
              {stops.length > 0 && (
                <MaterialIcons name="info-outline" size={16} color="#999" />
              )}
            </View>
          </Pressable>

          {destination && (
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <MaterialIcons name="location-on" size={20} color="#666" />
                <Text style={styles.infoLabel}>Destination</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>
                  {destination.latitude.toFixed(4)},{" "}
                  {destination.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <MaterialIcons name="timeline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Route Points</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>{route.length}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color="#fff" />
                <Text style={styles.buttonText}>Save Trip</Text>
              </>
            )}
          </Pressable>

          {onCancel && (
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <MaterialIcons name="close" size={20} color="#666" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Discard
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  mapContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mapImage: {
    width: "100%",
    height: 220,
  },
  mapPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  mapError: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  hidden: {
    opacity: 0,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    color: "#999",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  detailsContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: THEME.colors.primary,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButtonText: {
    color: "#666",
  },
});
