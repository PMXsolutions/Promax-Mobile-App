import { ShiftRosterService } from "@/services/shift";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { showMessage } from "react-native-flash-message";

export const useClockOut = (user: number, shiftRosterId: number) => {
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
      queryClient.invalidateQueries({
        queryKey: ["shift", { id: shiftRosterId }],
      });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      // const queriesToInvalidate = [
      //   ["shift", { id: shiftRosterId }],
      //   ["shifts"],
      // ];

      // queriesToInvalidate.forEach((query) =>
      //   queryClient.invalidateQueries({ queryKey: query })
      // );
      // return queryClient.invalidateQueries({
      //   queryKey: ["shift", { id: shiftRosterId }],
      // });
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
