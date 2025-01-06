import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;
const GoogleTest = () => {
  return (
    <SafeAreaView>
      <GooglePlacesAutocomplete
        placeholder="Type a place"
        onPress={(data, details = null) => console.log(data, details)}
        query={{ key: googlePlacesApiKey }}
        fetchDetails={true}
        onFail={(error) => console.log(error)}
        onNotFound={() => console.log("no results")}
        textInputProps={{
          autoFocus: true,
          blurOnSubmit: false,
        }}
      />
    </SafeAreaView>
  );
};

export default GoogleTest;

const styles = StyleSheet.create({});
