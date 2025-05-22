import React from "react";
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import Text from "./text";

interface Props {
  modalVisible: boolean;
  closeModal: () => void;
  title?: string;
  children: React.ReactNode;
}

const ModalPop = ({ title, modalVisible, closeModal, children }: Props) => {
  return (
    <Modal
      isVisible={modalVisible}
      // animationIn="fadeInUp"
      // animationOut="fadeOutDown"
      backdropOpacity={0.5}
      // onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      useNativeDriver
      // hideModalContentWhileAnimating
      style={styles.modal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoiding}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalView}>
            {title && (
              <View style={styles.header}>
                <Text weight="semiBold" size="lg">
                  {title}
                </Text>
              </View>
            )}
            <View style={styles.body}>{children}</View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0, // Fullscreen
  },
  keyboardAvoiding: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: Dimensions.get("window").width * 0.85,
    maxWidth: 360,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  header: {
    marginBottom: 12,
  },
  body: {
    // customize layout spacing if needed
  },
});

export default ModalPop;
