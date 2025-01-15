import { ScrollView, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { profileQuery } from "@/hooks/queries/profile";
import { THEME } from "@/constants/theme";
import { StaffProfile } from "@/types/auth";
import TextInput from "@/components/shared/input";
import CustomButton from "@/components/shared/custom-button";
import { showMessage } from "react-native-flash-message";
import { queryClient } from "@/libs/query";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { profileService } from "@/services/profile";
import useAuthStore from "@/store/use-auth-store";

const EditEmergencyForm = ({ id }: { id: string }) => {
  const { data: staffData } = profileQuery.useFetchStaffProfile(Number(id));
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    nextOfKin: "",
    kinEmail: "",
    kinPhoneNumber: "",
    relationship: "",
    kinCountry: "",
    kinState: "",
    kinCity: "",
    kinAddress: "",
    kinPostcode: "",
  });

  React.useEffect(() => {
    if (staffData) {
      setForm({
        nextOfKin: staffData.nextOfKin,
        kinEmail: staffData.kinEmail, // Add imageUrl to form state
        kinPhoneNumber: staffData.kinPhoneNumber || "",
        relationship: staffData.relationship || "",
        kinCountry: staffData.kinCountry || "",
        kinState: staffData.kinState || "",
        kinCity: staffData.kinCity || "",
        kinAddress: staffData.kinAddress || "",
        kinPostcode: staffData.kinPostcode || "",
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

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async () => {
      const reqBody = {
        ...staffData,
        ...form,
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

        <View style={{ rowGap: THEME.spacing.md }}>
          <TextInput
            label="Contact Name"
            value={form.nextOfKin}
            onChangeText={(value) => handleInputChange("nextOfKin", value)}
            editable={false}
          />
          <TextInput
            label="Email"
            value={form.kinEmail}
            onChangeText={(value) => handleInputChange("kinEmail", value)}
            editable={false}
          />
          <TextInput
            label="Phone Number"
            value={form.kinPhoneNumber}
            onChangeText={(value) => handleInputChange("kinPhoneNumber", value)}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Relationship"
            value={form.relationship}
            onChangeText={(value) => handleInputChange("relationship", value)}
          />
          <TextInput
            label="Nationality"
            value={form.kinCountry}
            onChangeText={(value) => handleInputChange("kinCountry", value)}
          />
          <TextInput
            label="State"
            value={form.kinState}
            onChangeText={(value) => handleInputChange("kinState", value)}
          />
          <TextInput
            label="City"
            value={form.kinCity}
            onChangeText={(value) => handleInputChange("kinCity", value)}
          />
          <TextInput
            label="Address"
            value={form.kinAddress}
            onChangeText={(value) => handleInputChange("kinAddress", value)}
          />
          <TextInput
            label="Post Code"
            value={form.kinPostcode}
            onChangeText={(value) => handleInputChange("kinPostcode", value)}
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

export default EditEmergencyForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 20,
  },

  footer: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
  },
});
