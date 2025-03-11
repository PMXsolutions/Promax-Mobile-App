import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import GoogleTextInput from "@/components/map/google-text-input";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import CustomButton from "@/components/shared/custom-button";
import { KeyboardAvoiderView } from "@good-react-native/keyboard-avoider";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  setDestination: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
      address: string;
    } | null>
  >;
}

const DestinationScreen: React.FC<Props> = ({
  destination,
  setDestination,
  setStep,
}) => {
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
  // useEffect(() => {
  //   const fetchLocation = async () => {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert(
  //         "Permission Denied",
  //         "Location permission is required to continue."
  //       );
  //       return;
  //     }
  //     const location = await Location.getCurrentPositionAsync({});
  //     setInitialLocation({
  //       latitude: location.coords.latitude,
  //       longitude: location.coords.longitude,
  //     });
  //   };

  //   fetchLocation();
  // }, []);

  const handleNext = () => {
    if (!destination) {
      Alert.alert("Error", "Please select a destination.");
      return;
    }
    setStep(2);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoiderView>
        <View>
          <Text style={styles.inputLabel}>Select Destination </Text>

          <GoogleTextInput
            icon={"map"}
            containerStyle={{
              backgroundColor: "#f5f5f5",
            }}
            textInputBackgroundColor="transparent"
            handlePress={(location) => setDestination(location)}
          />
        </View>
        <View style={{ marginTop: THEME.spacing.lg }}>
          <CustomButton title="Next" onPress={handleNext} />
        </View>
      </KeyboardAvoiderView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { rowGap: THEME.spacing.lg },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  inputLabel: {
    fontSize: THEME.fontSize.lg,
    fontFamily: THEME.fontFamily.semiBold,
    marginVertical: 10,
  },
});

export default DestinationScreen;
