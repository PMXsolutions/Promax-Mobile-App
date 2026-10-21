import { ShiftRosterService } from "@/services/shift";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
import { attendanceErrorMessage } from "@/libs/attendance-error";

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
      showMessage({
        message: attendanceErrorMessage(error, "clock out"),
        type: "danger",
      });
    },
  });
};
