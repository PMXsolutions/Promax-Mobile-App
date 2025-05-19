import React, { useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Text as RNText,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import GoogleTextInput from "@/components/map/google-text-input"; // Your custom wrapper
import CustomButton from "@/components/shared/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
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

const DestinationScreen = ({ destination, setDestination, setStep }: Props) => {
  const [showModal, setShowModal] = useState(false);

  const handleNext = () => {
    if (!destination) {
      alert("Please select a destination.");
      return;
    }
    setStep(2);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>Select Destination</Text>

      {/* Fake input field that opens the modal */}
      <Pressable onPress={() => setShowModal(true)} style={styles.fakeInput}>
        <MaterialIcons
          name="map"
          size={24}
          color="#444"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.fakeInputText}>
          {destination?.address || "Where do you want to go?"}
        </Text>
      </Pressable>

      <View style={{ marginTop: THEME.spacing.sm }}>
        <CustomButton title="Next" onPress={handleNext} />
      </View>

      {/* Modal with Google Autocomplete */}
      <Modal visible={showModal} animationType="slide">
        <SafeAreaView style={{ flex: 0.5 }}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <RNText style={styles.cancelText}>Cancel</RNText>
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              handlePress={(location) => {
                setDestination(location);
                setShowModal(false);
              }}
              containerStyle={{ backgroundColor: "#f5f5f5" }}
              textInputBackgroundColor="transparent"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: THEME.spacing.sm,
    rowGap: THEME.spacing.lg,
  },
  inputLabel: {
    fontSize: THEME.fontSize.lg,
    fontFamily: THEME.fontFamily.semiBold,
  },
  fakeInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff", // or "#f5f5f5" if your input uses that
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: "#d4d4d4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2, // for Android shadow
  },
  fakeInputText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    marginBottom: 10,
    alignItems: "flex-end",
  },
  cancelText: {
    fontSize: 16,
    color: THEME.colors.error,
  },
});

export default DestinationScreen;
