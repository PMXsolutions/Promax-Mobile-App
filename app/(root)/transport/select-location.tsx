import { StyleSheet, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import TransportLayout from "@/layout/transport";
import CustomButton from "@/components/shared/custom-button";
import Text from "@/components/shared/text";
import GoogleTextInput from "@/components/map/google-text-input";
import { useLocationStore } from "@/store/use-location-store";
import GoogleTest from "@/components/map/google-text";
import LocationTrackingScreen from "@/components/map/old-map";

const SelectLocation = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  return (
    <>
      {/* <LocationTrackingScreen /> */}
      <TransportLayout title="" snapPoints={["45%", "65%"]}>
        <View style={{ marginBottom: 12 }}>
          <Text size="lg" weight="semiBold" style={{ marginBottom: 12 }}>
            From
          </Text>

          <GoogleTextInput
            icon={"location-pin"}
            initialLocation={userAddress!}
            containerStyle={{
              backgroundColor: "#f5f5f5",
            }}
            textInputBackgroundColor="#f5f5f5"
            handlePress={(location) => setUserLocation(location)}
          />
        </View>

        <View style={{ marginVertical: 12 }}>
          <Text size="lg" weight="semiBold" style={{ marginBottom: 12 }}>
            To
          </Text>

          <GoogleTextInput
            icon={"map"}
            initialLocation={destinationAddress!}
            containerStyle={{
              backgroundColor: "#f5f5f5",
            }}
            textInputBackgroundColor="transparent"
            handlePress={(location) => setDestinationLocation(location)}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <CustomButton title="Continue" />
        </View>
      </TransportLayout>
    </>
  );
};

export default SelectLocation;

const styles = StyleSheet.create({});
