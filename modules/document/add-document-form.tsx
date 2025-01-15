import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import { THEME } from "@/constants/theme";
import Select from "@/components/shared/select";
import useAuthStore from "@/store/use-auth-store";
import { documentNames } from "@/constants/profile-data";
import { uploadDoc } from "@/utils/profile-image-handler";
import { showMessage } from "react-native-flash-message";
import Text from "@/components/shared/text";
import { DocumentPickerAsset } from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import TextInput from "@/components/shared/input";
import DatePicker from "@/components/shared/date-picker";
import CustomButton from "@/components/shared/custom-button";

interface DocType {
  label: string;
  value: string;
}

const AddForm = () => {
  const { staff, user } = useAuthStore();
  const [selectedValue, setSelectedValue] = useState("");
  const [docName, setDocName] = useState("");
  const [expiryDate, setExpiryDate] = useState(" ");

  const [uploadedDocument, setUploadedDocument] =
    useState<DocumentPickerAsset | null>(null);

  // Prepare document options
  const docArr = documentNames.map((item) => ({
    label: item,
    value: item,
  }));
  docArr.push({ label: "Others", value: "others" });

  // Handle dropdown change
  const handleDropdownChange = (item: DocType) => {
    setSelectedValue(item.value);
    if (item.value === "others") {
      setDocName(""); // Reset docName for manual entry
    } else {
      setDocName(item.value); // Automatically set the selected value
    }
  };

  // Handle document picker
  const handleImagePick = async () => {
    try {
      const docUri = await uploadDoc();
      if (docUri) {
        setUploadedDocument(docUri);
      }
    } catch (error) {
      showMessage({
        message: "Failed to select document",
        type: "danger",
      });
    }
  };

  // Check if "Others" is selected
  const isOtherSelected = docName === "others";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 10 }}
    >
      <View style={{ rowGap: THEME.spacing.md }}>
        {/* Dropdown Select */}
        <View>
          <Text style={styles.inputLabel}>Document List</Text>
          <Select
            options={docArr}
            placeholder="Select a Document"
            iconColor="#ccc"
            //   onChange={(value)=>setDocName(value)}
            onValueChange={(value) => setDocName(value?.value as string)}
            value={selectedValue}
          />
        </View>

        {/* Manual Document Name Input */}
        {isOtherSelected && (
          <TextInput
            label="Enter Document Name"
            placeholder="Enter Document Name"
            value={docName}
            onChangeText={(value) => setDocName(value)}
          />
        )}
        <DatePicker
          value={expiryDate}
          onChange={setExpiryDate}
          label="Expiration Date"
        />

        {/* Document Upload Section */}
        <Pressable style={styles.uploadBloc} onPress={handleImagePick}>
          <View style={styles.uploadButton}>
            <Text weight="regular" style={styles.uploadButtonText}>
              Tap to select file
            </Text>
          </View>
          <Text> (.pdf, .doc, .docx)</Text>
        </Pressable>

        {/* Display Uploaded Document */}
        {uploadedDocument && (
          <View style={[styles.uploadButton, styles.nameCont]}>
            <Text
              style={[styles.uploadButtonText, { flex: 1 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {uploadedDocument.name}
            </Text>
            <TouchableWithoutFeedback onPress={() => setUploadedDocument(null)}>
              <Feather name="x" color="red" size={20} />
            </TouchableWithoutFeedback>
          </View>
        )}
        <CustomButton
          title={"Submit"}
          //   onPress={() => handleFormSubmit()}
          loading={false}
        />
      </View>
    </ScrollView>
  );
};

export default AddForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fontFamily.semiBold,
    marginBottom: 5,
    color: THEME.colors.grayBg,
  },
  uploadBloc: {
    marginVertical: 2,
    padding: 15,
    borderWidth: 2,
    borderColor: THEME.colors.grayBg,
    borderRadius: 10,
    borderStyle: "dashed",
    gap: 15,
    alignItems: "center",
  },
  uploadButton: {
    padding: 10,
    backgroundColor: THEME.colors.white,
    elevation: 3,
    shadowColor: "#ccc",
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nameCont: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadButtonText: {
    color: THEME.colors.black,
  },
});
