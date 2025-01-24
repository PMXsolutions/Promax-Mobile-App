import { ShiftRosterService } from "@/services/shift";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { showMessage } from "react-native-flash-message";

export const useClockOut = (user: string, shiftRosterId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return ShiftRosterService.clockOut(user, shiftRosterId); // Ensure this API call works
    },

    //   mutationFn: () => handleClockOut(user, shiftRosterId),
    onSuccess: ({ data }) => {
      showMessage({
        message: data.message,
        description: "Well done!",
        type: "success",
      });
      return queryClient.invalidateQueries({
        queryKey: ["shifts"],
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        showMessage({
          message: error.response?.data?.message || "An error occurred",
          description: error.response?.data?.title,
          type: "danger",
        });
      }
    },
  });
};
