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

const EditInfoForm = ({ id }: { id: string }) => {
  const { data: staffData } = profileQuery.useFetchStaffProfile(Number(id));
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    instagram: "",
    linkedIn: "",
    facebook: "",
    youtube: "",
    twitter: "",
  });

  React.useEffect(() => {
    if (staffData) {
      setForm({
        instagram: staffData.instagram,
        linkedIn: staffData.linkedIn, // Add imageUrl to form state
        facebook: staffData.facebook || "",
        youtube: staffData.youtube || "",
        twitter: staffData.twitter || "",
      });
    }
  }, [staffData]);

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
            label="Instagram"
            value={form.instagram}
            onChangeText={(value) => handleInputChange("instagram", value)}
          />
          <TextInput
            label="Linked-In"
            value={form.linkedIn}
            onChangeText={(value) => handleInputChange("linkedIn", value)}
          />
          <TextInput
            label="Facebook"
            value={form.facebook}
            onChangeText={(value) => handleInputChange("facebook", value)}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Youtube"
            value={form.youtube}
            onChangeText={(value) => handleInputChange("youtube", value)}
          />
          <TextInput
            label="X (Formerly twitter)"
            value={form.twitter}
            onChangeText={(value) => handleInputChange("twitter", value)}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Save Changes"
          onPress={() => handleFormSubmit()}
          loading={isPending}
        />
      </View>
    </>
  );
};

export default EditInfoForm;

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
