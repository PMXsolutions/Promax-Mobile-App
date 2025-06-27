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
import { documentNames } from "@/constants/profile-data";
import { uploadDoc } from "@/utils/profile-image-handler";
import { showMessage } from "react-native-flash-message";
import Text from "@/components/shared/text";
import { DocumentPickerAsset } from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import TextInput from "@/components/shared/input";
import CustomButton from "@/components/shared/custom-button";
import DateModal from "@/components/shared/date-modal";
import useAuthStore from "@/store/use-auth-store";
import { reportService } from "@/services/report";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/libs/query";
import { router } from "expo-router";
import KeyboardAwareWrapper from "@/components/wrapper/keyboard-aware-wrapper";

const AddForm = () => {
  const { user, staff } = useAuthStore();
  const [docName, setDocName] = useState("");
  const [otherDocName, setOtherDocName] = useState(""); // Separate state for "Other Name"
  const [expiryDate, setExpiryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  });

  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPickerAsset | null>(null);

  // Prepare document options
  const docArr = documentNames.map((item) => ({
    label: item,
    value: item,
  }));
  docArr.push({ label: "Others", value: "others" });

  // Handle document picker
  const handleImagePick = async () => {
    try {
      const docUri = await uploadDoc();
      if (docUri) {
        setSelectedDocument(docUri);
        setUploadedDocument(docUri.uri);
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

  // const handleSubmit = () => {
  //   const finalDocName = docName === "others" ? otherDocName : docName;
  //   console.log("Document Name:", finalDocName, expiryDate);
  // };

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async () => {
      const finalDocName = docName === "others" ? otherDocName : docName;
      const reqBody = {
        docFile: selectedDocument,
        companyId: user?.companyId,
        docuName: finalDocName,
        expirationDate: expiryDate,
        staffName: staff?.fullName,
      };
      return reportService.handleUploadStaffDocument(
        Number(staff?.staffId),
        user?.userId as string,
        reqBody
      ); // Ensure this API call works
    },
    onSuccess: ({ data }) => {
      showMessage({
        message: "Document Submitted Successfully",
        type: "success",
      });

      router.back();
      return queryClient.invalidateQueries({
        queryKey: ["staffDocument", { id: staff?.staffId }],
      });
    },

    onError: (error: any) => {
      showMessage({
        message: "Document Submission failed",
        type: "danger",
      });
    },
  });

  const handleFormSubmit = () => {
    if (!docName || docName === "") {
      showMessage({
        message: "Please select or enter a document name",
        type: "info",
      });
      return;
    }
    if (!uploadedDocument) {
      showMessage({
        message: "Please upload a document",
        type: "info",
      });

      return;
    }
    onSubmit(); // Should call the mutation function
  };

  return (
    <KeyboardAwareWrapper>
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
              onValueChange={(value) => setDocName(value?.value as string)}
              value={docName}
            />
          </View>

          {/* Manual Document Name Input */}
          {isOtherSelected && (
            <TextInput
              required
              label="Enter Document Name"
              placeholder="Enter Document Name"
              value={otherDocName} // Use the separate state here
              onChangeText={(value) => setOtherDocName(value)} // Update the separate state
            />
          )}

          <DateModal
            label="Expiration Date"
            value={expiryDate}
            onChange={setExpiryDate}
          />

          {/* Document Upload Section */}
          <View>
            <Text style={styles.inputLabel}>Upload File </Text>

            <Pressable
              style={[
                styles.uploadBloc,
                { borderColor: THEME.colors.grayBg, borderStyle: "dashed" },
              ]}
              onPress={handleImagePick}
            >
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
                  {selectedDocument?.name}
                </Text>
                <TouchableWithoutFeedback
                  onPress={() => setUploadedDocument(null)}
                >
                  <Feather name="x" color="red" size={20} />
                </TouchableWithoutFeedback>
              </View>
            )}
          </View>
          <CustomButton
            title={"Submit"}
            onPress={handleFormSubmit}
            // Handle submission logic here
            loading={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAwareWrapper>
  );
};

export default AddForm;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
    color: THEME.colors.white,
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

    borderRadius: 10,

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
