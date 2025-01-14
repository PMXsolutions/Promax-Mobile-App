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
import KeyboardWrapper from "@/components/shared/keyboard-wrapper";
import CustomButton from "@/components/shared/custom-button";
import Select from "@/components/shared/select";
import Text from "@/components/shared/text";
import DatePicker from "@/components/shared/date-picker";
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

const EditProfileForm = ({ id }: { id: string }) => {
  const { data: staffData } = profileQuery.useFetchStaffProfile(Number(id));
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    imageFile: "",
    imageUrl: "", // Add imageUrl to form state
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
  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async () => {
      const reqBody = {
        ...staffData,
        ...form,
        dateOfBirth: dateOfBirth,
      };
      return profileService.handleEditStaffProfile(
        Number(staffData?.staffId),
        user?.userId as string,
        reqBody as StaffProfile
      ); // Ensure this API call works
    },
    onSuccess: ({ data }) => {
      showMessage({
        message: data?.message,
        description: "Profile Edited Successfully",
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
          <DatePicker
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
            containerStyle={styles.inputContainerStyle}
            textAlign="left"
            placeholder="Type here..."
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Save"
          onPress={() => handleFormSubmit()}
          loading={isPending}
        />
      </View>
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
});
