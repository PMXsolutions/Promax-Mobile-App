import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { profileQuery } from "@/hooks/queries/profile";
import { Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";
import { StaffProfile } from "@/types/auth";
import TextInput from "@/components/shared/input";
import CustomButton from "@/components/shared/custom-button";
import Select from "@/components/shared/select";
import Text from "@/components/shared/text";
import { showMessage } from "react-native-flash-message";
import { queryClient } from "@/libs/query";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { profileService } from "@/services/profile";
import useAuthStore from "@/store/use-auth-store";
import {
  pickImageOrUseCamera,
  resizeImage,
} from "@/utils/profile-image-handler";
import DateModal from "@/components/shared/date-modal";
import KeyboardAwareWrapper from "@/components/wrapper/keyboard-aware-wrapper";
import SignatureComponent from "@/components/signature";

// type StaffProfileWithSig = StaffProfile & {
//   signatureFile?: {
//     uri: string;
//     name: string;
//     type: string;
//   };
// };

const EditProfileForm = ({ id }: { id: string }) => {
  const { data: staffData } = profileQuery.useFetchStaffProfile(Number(id));
  const { user } = useAuthStore();
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [signature, setSignature] = useState<string | null>(null); // base64

  const [loadingSig, setLoadingSig] = useState(false);

  const [form, setForm] = useState({
    imageFile: "https://placehold.co/400",
    imageUrl: "https://placehold.co/400", // Add imageUrl to form state
    firstName: "",
    surName: "",
    middleName: "",
    phoneNumber: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    address: "",
    suburb: "",
    postcode: "",
    aboutMe: "",
    dateOfBirth: "",
  });

  React.useEffect(() => {
    if (staffData) {
      setForm({
        imageFile: staffData.imageFile,
        imageUrl: staffData.imageUrl, // Add imageUrl to form state
        firstName: staffData.firstName || "",
        surName: staffData.surName || "",
        middleName: staffData.middleName || "",
        phoneNumber: staffData.phoneNumber || "",
        gender: staffData.gender || "",
        country: staffData.country || "",
        state: staffData.state || "",
        city: staffData.city || "",
        address: staffData.address || "",
        suburb: staffData.suburb || "",
        postcode: staffData.postcode || "",
        aboutMe: staffData.aboutMe || "",
        dateOfBirth: staffData.dateOfBirth || "",
      });
    }
  }, [staffData]);
  const [dateOfBirth, setDateOfBirth] = useState(staffData?.dateOfBirth || "");
  const imageUri = signature ?? staffData?.signatureUrl;
  const handleInputChange = <K extends keyof StaffProfile>(
    name: K,
    value: StaffProfile[K]
  ) => {
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImagePick = async () => {
    try {
      const imageUri = await pickImageOrUseCamera();

      if (imageUri) {
        const resizedImageUri = await resizeImage(imageUri);
        // console.log(resizedImageUri);

        if (resizedImageUri) {
          handleInputChange("imageFile", resizedImageUri); // Update imageUrl in form state
        }
      }
    } catch (error) {
      showMessage({
        message: "Failed to select image",
        type: "danger",
      });
    }
  };
  // const { mutate: onSubmit, isPending } = useMutation({
  //   mutationFn: async () => {
  //     const reqBody = {
  //       ...staffData,
  //       ...form,
  //       dateOfBirth: dateOfBirth,
  //     };
  //     return profileService.handleEditStaffProfile(
  //       Number(staffData?.staffId),
  //       user?.userId as string,
  //       reqBody as StaffProfile
  //     ); // Ensure this API call works
  //   },
  //   onSuccess: ({ data }) => {
  //     showMessage({
  //       message: data?.message,
  //       type: "success",
  //     });

  //     router.back();
  //     return queryClient.invalidateQueries({
  //       queryKey: ["staff", { id: staffData?.staffId }],
  //     });
  //   },

  //   onError: (error: any) => {
  //     showMessage({
  //       message: error.response?.data?.message,
  //       type: "danger",
  //     });
  //   },
  // });
  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async () => {
      const reqBody = {
        ...staffData,
        ...form,
        dateOfBirth: dateOfBirth,
      };

      // If there's a new signature captured (as base64)
      if (signature && signature.startsWith("data:image")) {
        const sigBlob = await fetch(signature).then((res) => res.blob());

        // Manually add the signature blob to reqBody
        // Even though it's not typed in StaffProfile, we'll inject it
        // (reqBody as StaffProfile).signatureFile = {
        //   uri: signature,
        //   name: "signature.png",
        //   type: "image/png",
        // };
        console.log(sigBlob);
        handleInputChange("signatureFile", signature);
      }

      return profileService.handleEditStaffProfile(
        Number(staffData?.staffId),
        user?.userId as string,
        reqBody as StaffProfile
      );
    },

    onSuccess: ({ data }) => {
      showMessage({
        message: data?.message,
        type: "success",
      });

      router.back();
      return queryClient.invalidateQueries({
        queryKey: ["staff", { id: staffData?.staffId }],
      });
    },

    onError: (error: any) => {
      showMessage({
        message: error.response?.data?.message,
        type: "danger",
      });
    },
  });

  const handleFormSubmit = () => {
    onSubmit(); // Should call the mutation function
  };

  return (
    <>
      <KeyboardAwareWrapper>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {/* Render fields here */}
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              <ImageBackground
                source={{ uri: form.imageUrl }}
                style={styles.avatar}
                imageStyle={styles.avatar}
              >
                <Image
                  source={{ uri: form.imageFile }}
                  style={[
                    styles.avatar,
                    { borderWidth: 1, borderColor: THEME.colors.lightGray },
                  ]}
                  resizeMode="cover"
                />
              </ImageBackground>

              <TouchableOpacity
                style={styles.cameraIcon}
                onPress={handleImagePick}
              >
                <Feather name="camera" size={28} color={THEME.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ rowGap: THEME.spacing.md }}>
            <TextInput
              label="First Name"
              value={form.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              editable={false}
            />
            <TextInput
              label="Last Name"
              value={form.surName}
              onChangeText={(value) => handleInputChange("surName", value)}
              editable={false}
            />
            <TextInput
              label="Middle Name"
              value={form.middleName}
              onChangeText={(value) => handleInputChange("middleName", value)}
            />
            <TextInput
              label="Phone Number"
              value={form.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
              keyboardType="phone-pad"
            />
            <View>
              <Text style={styles.inputLabel}>Gender</Text>
              <Select
                value={form?.gender}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Transgender", label: "Transgender" },
                  {
                    value: "Non-binary/non-conforming",
                    label: "Non-binary/non-conforming",
                  },
                  {
                    value: "Prefer not to respond",
                    label: "Prefer not to respond",
                  },
                ]}
                placeholder={form?.gender}
                iconColor="#ccc"
                onValueChange={(value) =>
                  handleInputChange("gender", value?.value as string)
                }
              />
            </View>

            <DateModal
              value={dateOfBirth}
              onChange={setDateOfBirth}
              label="Date of Birth"
            />

            {/* //////////// */}
            <TextInput
              label="Country"
              value={form.country}
              onChangeText={(value) => handleInputChange("country", value)}
            />
            <TextInput
              label="State"
              value={form.state}
              onChangeText={(value) => handleInputChange("state", value)}
            />
            <TextInput
              label="City"
              value={form.city}
              onChangeText={(value) => handleInputChange("city", value)}
            />
            <TextInput
              label="Address"
              value={form.address}
              onChangeText={(value) => handleInputChange("address", value)}
            />
            <TextInput
              label="Suburb"
              value={form.suburb}
              onChangeText={(value) => handleInputChange("suburb", value)}
            />
            <TextInput
              label="Postcode"
              value={form.postcode}
              onChangeText={(value) => handleInputChange("postcode", value)}
            />
            <TextInput
              label="About Me"
              value={form.aboutMe}
              onChangeText={(value) => handleInputChange("aboutMe", value)}
              numberOfLines={4}
              multiline
              // containerStyle={styles.inputContainerStyle}
              textAlign="left"
              placeholder="Type here..."
            />

            <View style={styles.signatureSection}>
              {loadingSig && <Text>Uploading signature...</Text>}

              {!staffData?.signatureUrl && !signature && (
                <TouchableOpacity
                  onPress={() => setSignatureModalVisible(true)}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>Add Signature</Text>
                </TouchableOpacity>
              )}

              {(staffData?.signatureUrl || signature) && (
                <>
                  <View style={styles.labelRow}>
                    <Text style={styles.signatureLabel} weight="semiBold">
                      Signature
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSignatureModalVisible(true)}
                      style={styles.editTag}
                    >
                      <Text style={styles.editTagText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <Image
                    source={{ uri: signature ?? staffData?.signatureUrl! }}
                    style={styles.signatureImage}
                  />
                </>
              )}

              <SignatureComponent
                visible={signatureModalVisible}
                onClose={() => setSignatureModalVisible(false)}
                onSave={(sig) => setSignature(sig)}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <CustomButton
                title="Save Changes"
                onPress={() => handleFormSubmit()}
                loading={isPending}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareWrapper>

      {/* <View style={styles.footer}></View> */}
    </>
  );
};

export default EditProfileForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
  },
  profileContainer: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 1,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10,
    right: -10,
    backgroundColor: THEME.colors.white,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  inputContainerStyle: {
    width: "100%",
    height: 80,
    alignItems: "flex-start",
  },
  inputLabel: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fontFamily.semiBold,
    marginBottom: 5,
    color: THEME.colors.grayBg,
  },
  footer: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
  },
  signatureSection: {
    marginTop: 12,
  },
  addButton: {
    backgroundColor: "#3B82F6", // blue
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  labelRow: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 16,
  },
  editTag: {
    backgroundColor: "#FACC15", // yellow
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  editTagText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  signatureImage: {
    width: 140,
    paddingHorizontal: 10,
    height: 80,
    resizeMode: "contain",
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f4f4f4",
  },
});
