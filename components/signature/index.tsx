import React, { useRef, useState } from "react";
import { View, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import Signature from "react-native-signature-canvas";
import * as ImagePicker from "expo-image-picker";
import Modal from "react-native-modal";
import Text from "../shared/text";
import { captureRef } from "react-native-view-shot";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import TextInput from "../shared/input";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

const SignatureComponent = ({ visible, onClose, onSave }: Props) => {
  const [mode, setMode] = useState<"draw" | "type" | "upload">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const typedSigRef = useRef<View>(null);
  const signatureRef = useRef<any>(null);
  const switchMode = (mode: "draw" | "type" | "upload") => {
    setMode(mode);
    setTypedSignature("");
    setUploadedImage(null);
  };
  const handleSignature = (signature: string) => {
    onSave(signature);
    onClose();
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/png;base64,${result.assets[0].base64}`;
      setUploadedImage(base64Image);
      onSave(base64Image);
      onClose();
    }
  };

  const saveTypedSignature = async () => {
    if (!typedSignature.trim()) {
      Alert.alert("Error", "Please type your signature.");
      return;
    }

    try {
      const uri = await captureRef(typedSigRef, {
        format: "png",
        quality: 1,
        result: "data-uri", // This gives you a base64 string with data:image/png
      });

      onSave(uri); // Same as drawn or uploaded
      onClose();
    } catch (error) {
      console.error("Error capturing typed signature:", error);
      Alert.alert("Oops", "Failed to generate signature image.");
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Signature</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeIcon} size="3xl" weight="bold">
            ×
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => switchMode("draw")}
            style={styles.tabButton}
          >
            <MaterialCommunityIcons
              name="draw"
              size={18}
              color={mode === "draw" ? "#000" : "#888"}
            />
            <Text style={mode === "draw" ? styles.activeTab : styles.tab}>
              Draw
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchMode("type")}
            style={styles.tabButton}
          >
            <MaterialCommunityIcons
              name="keyboard"
              size={18}
              color={mode === "type" ? "#000" : "#888"}
            />
            <Text style={mode === "type" ? styles.activeTab : styles.tab}>
              Type
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchMode("upload")}
            style={styles.tabButton}
          >
            <MaterialCommunityIcons
              name="file-upload"
              size={18}
              color={mode === "upload" ? "#000" : "#888"}
            />
            <Text style={mode === "upload" ? styles.activeTab : styles.tab}>
              Upload
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {mode === "draw" && (
          <View style={{ height: 200 }}>
            <Signature
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={() => Alert.alert("Please sign before saving.")}
              penColor="black"
              backgroundColor="#fff"
              clearText="Clear"
              confirmText="Save"
              descriptionText="Sign above"
              webStyle={`
  .m-signature-pad {
    box-shadow: none; 
    border: none;
    margin: 0;
    background-color:"#0001";
  }
  body, html {
    height: 100%;
    margin: 0;
  }
    .m-signature-pad--footer {
  display: none;
}
  canvas {
    height: 100% !important;
    width: 100% !important;
  }
`}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => signatureRef.current?.clearSignature()}
                style={[styles.button, styles.clearButton]}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => signatureRef.current?.readSignature()}
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {mode === "type" && (
          <View>
            <TextInput
              value={typedSignature}
              onChangeText={setTypedSignature}
              placeholder="Type your name..."
              style={styles.textInput}
            />

            {/* Live Signature Preview */}
            {typedSignature && (
              <View ref={typedSigRef} style={styles.previewBox}>
                <Text style={styles.previewSignature}>{typedSignature}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={saveTypedSignature}
              style={styles.greenButton}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === "upload" && (
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              onPress={handleUpload}
              style={styles.purpleButton}
            >
              <Text style={styles.buttonText}>Pick from Gallery</Text>
            </TouchableOpacity>
            {uploadedImage && (
              <Image
                source={{ uri: uploadedImage }}
                style={styles.uploadedImage}
                resizeMode="contain"
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  tab: {
    fontSize: 16,
    color: "#666",
    marginLeft: 2,
  },
  activeTab: {
    fontSize: 16,
    fontFamily: THEME.fontFamily.bold,
    color: "#000",
    marginLeft: 2,
  },
  textInput: {
    fontSize: 16,
    textAlign: "center",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  greenButton: {
    backgroundColor: "#22c55e",
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  purpleButton: {
    backgroundColor: "#7e22ce",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  uploadContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  uploadedImage: {
    width: 200,
    height: 100,
    marginTop: 10,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#22c55e", // green
  },
  clearButton: {
    backgroundColor: "#ef4444", // red
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeIcon: {
    paddingHorizontal: 8,
    color: "red",
  },
  previewBox: {
    marginTop: 12,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  previewSignature: {
    fontSize: 36,
    fontFamily: "DancingScript_400Regular", // Make sure you've loaded the font
    color: "#333",
  },
});

export default SignatureComponent;
