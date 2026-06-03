import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import { THEME } from "@/constants/theme";
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
import { reportQuery } from "@/hooks/queries/report";
import { DocumentData } from "@/types/report";

const EditForm = ({ id }: { id: string }) => {
  const { data: docData, isLoading } = reportQuery.useFetchStaffDocumentDetail(
    Number(id)
  );

  const [form, setForm] = useState({
    documentName: "",
    documentFile: "",
  });
  const { user, staff } = useAuthStore();

  const [expiryDate, setExpiryDate] = useState(docData?.expirationDate || "");
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPickerAsset | null>(null);
  React.useEffect(() => {
    if (docData) {
      setForm({
        documentName: docData.documentName,
        documentFile: "",
      });
      setExpiryDate(docData.expirationDate || "");
    }
  }, [docData]);

  const handleInputChange = <K extends keyof DocumentData>(
    name: K,
    value: DocumentData[K]
  ) => {
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async () => {
      const reqBody = {
        docFile: selectedDocument,
        companyId: user?.companyId,
        docuName: form.documentName,
        expirationDate: expiryDate,
        staffName: staff?.fullName,
      };
      return reportService.handleEditStaffDocument(
        Number(id),
        Number(staff?.staffId),
        user?.userId as string,
        reqBody
      ); // Ensure this API call works
    },
    onSuccess: ({ data }) => {
      showMessage({
        message: "Document Edited Successfully",
        type: "success",
      });

      router.back();
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["staffDocument", { id: staff?.staffId }],
        }),
        queryClient.invalidateQueries({
          queryKey: ["staffDocument", "edit", { id: Number(id) }],
        }),
      ]);
    },

    onError: (error: any) => {
      showMessage({
        message:
          error.response?.data?.message || "Document Submission failed",
        type: "danger",
      });
    },
  });

  const handleFormSubmit = () => {
    if (!form.documentName || form.documentName === "") {
      showMessage({
        message: "Document name is required",
        type: "info",
      });
      return;
    }
    onSubmit(); // Should call the mutation function
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 10 }}
    >
      <View style={{ rowGap: THEME.spacing.md }}>
        <TextInput
          label="Document Name"
          value={form.documentName}
          onChangeText={(value) => handleInputChange("documentName", value)}
        />

        <DateModal
          label="Expiration Date"
          value={expiryDate}
          onChange={setExpiryDate}
        />

        {/* Document Upload Section */}
        <View>
          <Text style={styles.inputLabel}>Upload Updated File </Text>

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
                onPress={() => {
                  setUploadedDocument(null);
                  setSelectedDocument(null);
                }}
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
  );
};

export default EditForm;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
    color: THEME.colors.white,
  },
  inputLabel: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fontFamily.semiBold,
    color: THEME.colors.grayBg,
    marginBottom: 5,
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
