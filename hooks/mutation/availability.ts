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
    // Recently updated: accept fresh mutate-time variables to avoid stale availability payloads.
    mutationFn: (nextInfo?: FormSubmitType) =>
      profileService.submitStaffAvailability(nextInfo ?? formInfo),
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
    mutationFn: (nextInfo?: FormEditType) =>
      profileService.editStaffAvailability(nextInfo ?? formInfo),
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
    },
  });
};
const useDeleteStaffAvailability = (id: number) => {
  return useMutation({
    mutationFn: (nextId?: number) =>
      profileService.deleteStaffAvailability(nextId ?? id),
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
