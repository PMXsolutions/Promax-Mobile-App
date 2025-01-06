import React, { useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const MapPage: React.FC = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const snapPoints = ["40%", "100%"]; // Initial button (40%) and full screen (100%)

  // Function to handle destination selection
  const handleDestinationSelect = (data: any, details: any) => {
    const { lat, lng } = details.geometry.location;
    setDestination({ latitude: lat, longitude: lng });
    bottomSheetRef.current?.snapToIndex(0); // Collapse the bottom sheet after selection
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Map Component */}
      <MapView style={styles.map}>
        {/* Default Marker */}
        <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={destination}
            pinColor="blue"
            title="Destination"
          />
        )}
      </MapView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0} // Start at the smaller snap point
        enablePanDownToClose={false} // Prevent closing
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {/* Initial "Where to?" Button */}
          <View style={styles.initialTab}>
            <TouchableOpacity
              style={styles.whereToButton}
              onPress={() => bottomSheetRef.current?.snapToIndex(1)} // Expand to full screen
            >
              <Text style={styles.whereToText}>Where to?</Text>
            </TouchableOpacity>
          </View>

          {/* Google Places Autocomplete (Visible when full-screen) */}
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              placeholder="Search for your destination"
              fetchDetails={true}
              onPress={handleDestinationSelect}
              query={{
                key: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your API key
                language: "en",
              }}
              styles={{
                container: { flex: 1 },
                textInput: { height: 50, fontSize: 16 },
              }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
  },
  initialTab: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%", // Ensures the "Where to?" button is centered initially
  },
  whereToButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  whereToText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  autocompleteContainer: {
    flex: 1,
    padding: 20,
  },
});

export default MapPage;
