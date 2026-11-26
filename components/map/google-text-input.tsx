import { TouchableOpacity, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { Feather } from "@expo/vector-icons";
import { GoogleInputProps } from "@/types/type";
import { placesConfiguration } from "@/constants/places";
import { readPlaceLocation } from "@/utils/place-location";
import { router } from "expo-router";

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          // zIndex: 50,
          borderRadius: 12,
        },
        containerStyle,
      ]}
    >
      <GooglePlacesAutocomplete
        isNewPlacesAPI={true}
        fields="id,location,formattedAddress"
        requestUrl={placesConfiguration.requestUrl}
        fetchDetails={true}
        placeholder="Search"
        debounce={200}
        minLength={2}
        timeout={10000}
        enablePoweredByContainer={true}
        nearbyPlacesAPI="GooglePlacesSearch"
        currentLocation={false}
        predefinedPlaces={[]} // Prevents crash
        predefinedPlacesAlwaysVisible={false}
        listUnderlayColor="#eee"
        isRowScrollable={true}
        keyboardShouldPersistTaps="handled"
        onFail={(err) => console.warn("Autocomplete failed:", err)}
        onNotFound={() => console.log("No results found")}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            marginHorizontal: 10,
            position: "relative",
            shadowColor: "#d4d4d4",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor ?? "white",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            width: "100%",
            borderRadius: 200,
          },
          listView: {
            backgroundColor: textInputBackgroundColor ?? "white",
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            shadowColor: "#d4d4d4",
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) => {
          const location = readPlaceLocation(details);
          if (!location) return;
          handlePress({ ...location, address: data.description });
        }}
        query={{
          key: placesConfiguration.apiKey,
          language: "en",
        }}
        renderRightButton={() => (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 24,
              height: 24,
            }}
          >
            <Feather name={icon || "search"} size={24} />
          </View>
        )}
        renderLeftButton={() => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 24,
              height: 24,
            }}
          >
            <Feather name="arrow-left" size={24} />
          </TouchableOpacity>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
          placeholder: initialLocation ?? "Type in an address...",
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
