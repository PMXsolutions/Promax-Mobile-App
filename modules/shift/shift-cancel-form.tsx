import { StyleSheet, View } from "react-native";
import React from "react";
import CustomButton from "@/components/shared/custom-button";
import { THEME } from "@/constants/theme";
import { ShiftRosterService } from "@/services/shift";
import { useMutation } from "@tanstack/react-query";
import { FormInput } from "@/components/wrapper";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "@/store/use-auth-store";
import { showMessage } from "react-native-flash-message";
import { queryClient } from "@/libs/query";
import { router } from "expo-router";

const formSchema = z.object({
  reason: z.string().min(4, "Reason is required"),
});
type FormValue = z.infer<typeof formSchema>;
const ShiftCancelForm = ({ shiftId }: { shiftId: number }) => {
  const { user } = useAuthStore();
  const form = useForm<FormValue>({
    resolver: zodResolver(formSchema),
  });

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async (data: FormValue) => {
      return ShiftRosterService.submitCancellationReason(
        user?.userId as string,
        data.reason,
        shiftId
      );
    },
    onSuccess: ({ data }) => {
      showMessage({
        message: data.message,
        type: "success",
      });
      form.reset();
      //   navigation.navigate("Dashboard");
      router.push("/(root)/(tabs)");
      return queryClient.invalidateQueries({
        queryKey: ["shifts"],
      });
    },
    onError: (error) => {
      showMessage({
        message: "Unable to submit form",
        type: "danger",
      });
    },
  });
  const handleFormSubmit: SubmitHandler<FormValue> = (data) => {
    onSubmit(data); // Should call the mutation function
  };

  return (
    <View style={{ marginTop: 20, rowGap: THEME.spacing.lg }}>
      <View>
        <FormInput
          label="Enter Reason for cancellation"
          required
          control={form.control}
          name="reason"
          style={styles.inputStyle}
          multiline
          containerStyle={styles.inputContainerStyle}
          placeholder="Type here..."
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <CustomButton
          title="Submit"
          onPress={form.handleSubmit(handleFormSubmit)}
          loading={isPending}
        />
      </View>
    </View>
  );
};

export default ShiftCancelForm;

const styles = StyleSheet.create({
  inputContainerStyle: {
    width: "100%",
    height: 150,
    alignItems: "flex-start",
  },
  inputStyle: { height: 150, textAlignVertical: "top" },
});
