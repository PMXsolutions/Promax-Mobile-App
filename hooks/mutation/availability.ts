import { queryClient } from "@/libs/query";
import { profileService } from "@/services/profile";
import { useMutation } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
export interface FormSubmitType {
  user: string;
  staffId: number;
  companyID: number;
  day: string;
  newStartTime: string;
  newEndTime: string;
}
export interface FormEditType {
  user: string;
  staffId: number;
  companyID: number;
  staffAvailibilityId: number;
  days: string;
  fromTimeOfDay: string | undefined;
  toTimeOfDay?: string | undefined;
}
const useSubmitStaffAvailability = (formInfo: FormSubmitType) => {
  return useMutation({
    mutationFn: () => profileService.submitStaffAvailability(formInfo),
    onSuccess: ({ data }) => {
      showMessage({
        type: "success",
        message: data?.message,
      });
      return queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },

    onError: (error: any) => {
      showMessage({
        type: "danger",
        message: error.response?.data?.message || "An error occurred",
      });
      return queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },
  });
};
const useEditStaffAvailability = (formInfo: FormEditType) => {
  return useMutation({
    mutationFn: () => profileService.editStaffAvailability(formInfo),
    onSuccess: ({ data }) => {
      showMessage({
        type: "success",
        message: data?.message,
      });
      return queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },

    onError: (error: any) => {
      showMessage({
        type: "danger",
        message: error.response?.data?.message || "An error occurred",
      });
      return queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },
  });
};
const useDeleteStaffAvailability = (id: number) => {
  return useMutation({
    mutationFn: () => profileService.deleteStaffAvailability(id),
    onSuccess: ({ data }) => {
      showMessage({
        type: "success",
        message: data?.message,
      });
      return queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },

    onError: (error: any) => {
      showMessage({
        type: "danger",
        message: error.response?.data?.message || "An error occurred",
      });
      // return queryClient.invalidateQueries({
      //   queryKey: ["staffAvailability", staffId],
      // });
    },
  });
};

export const availbilityMutation = {
  useSubmitStaffAvailability,
  useEditStaffAvailability,
  useDeleteStaffAvailability,
};
