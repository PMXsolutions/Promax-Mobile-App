import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { MaterialIcons } from "@expo/vector-icons";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          fetchDetails={true}
          placeholder="Search"
          debounce={200}
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
              backgroundColor: textInputBackgroundColor
                ? textInputBackgroundColor
                : "white",
              fontSize: 16,
              fontWeight: "600",
              marginTop: 5,
              width: "100%",
              borderRadius: 200,
            },
            listView: {
              backgroundColor: textInputBackgroundColor
                ? textInputBackgroundColor
                : "white",
              position: "relative",
              top: 0,
              width: "100%",
              borderRadius: 10,
              shadowColor: "#d4d4d4",
              zIndex: 99,
            },
          }}
          onPress={(data, details = null) => {
            handlePress({
              latitude: details?.geometry.location.lat!,
              longitude: details?.geometry.location.lng!,
              address: data.description,
            });
          }}
          query={{
            key: googlePlacesApiKey,
            language: "en",
          }}
          renderLeftButton={() => (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: 24,
                height: 24,
              }}
            >
              <MaterialIcons name={icon ? icon : "search"} size={24} />
            </View>
          )}
          textInputProps={{
            placeholderTextColor: "gray",
            placeholder: initialLocation ?? "Where do you want to go?",
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default GoogleTextInput;
