import React from "react";
import { View, TouchableWithoutFeedback, Modal } from "react-native";
import { ModalProps } from "react-native";
import { THEME } from "@/constants/theme";
import { StyleSheet } from "react-native";
import Text from "./text";

interface Props extends ModalProps {
  modalVisible: boolean;
  closeModal: () => void;
  title?: string;
}
const ModalPop = ({ title, modalVisible, closeModal, children }: Props) => (
  <Modal
    transparent={true}
    animationType="fade"
    visible={modalVisible}
    onRequestClose={closeModal}
  >
    <TouchableWithoutFeedback onPress={closeModal}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text weight="semiBold" size="lg">
                {title}
              </Text>
              {/* <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="cancel" width={22} />
              </TouchableOpacity> */}
            </View>

            {children}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    minWidth: 320,
    padding: 20,
    // gap: 18,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: THEME.colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default ModalPop;
