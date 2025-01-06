import { reportService } from "@/services/report";
import { ShiftReport } from "@/types/report";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { showMessage } from "react-native-flash-message";

const useEditReport = (
  shiftReportId: number,
  userId: number,
  formInfo: ShiftReport
) => {
  console.log(shiftReportId, userId, formInfo);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      reportService.handleEditShiftForm(shiftReportId, userId, formInfo),
    onSuccess: ({ data }) => {
      showMessage({
        message: data.message,
        description: "Report Edited Successfully",
        type: "success",
      });

      router.back();
      return queryClient.invalidateQueries({
        queryKey: ["staffReports", userId],
      });
    },

    onError: (error: any) => {
      showMessage({
        message: error.response?.data?.message,
        type: "danger",
      });
    },
  });
};

export const reportMutation = {
  useEditReport,
};
