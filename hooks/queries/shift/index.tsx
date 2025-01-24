import { useFocusNotifyOnChangeProps } from "@/helpers/notifyOnFocus";
import { ShiftRosterService } from "@/services/shift";
import { ShiftRosterType } from "@/types/shift";
import { useQuery } from "@tanstack/react-query";

const useShiftRoster = (staffId: number) => {
  const notifyOnChangeProps = useFocusNotifyOnChangeProps();
  return useQuery<ShiftRosterType[]>({
    queryKey: ["shifts"],
    queryFn: () => ShiftRosterService.fetchStaffShift(staffId),
    notifyOnChangeProps,
    refetchOnWindowFocus: true,
    // staleTime: 300000, // 5 minutes
    enabled: !!staffId, // Only run the query if staffId is defined
  });
};
const useShiftDetail = (shiftId: number) => {
  return useQuery<ShiftRosterType>({
    queryKey: ["shifts", "detail", { id: shiftId }],
    queryFn: () => ShiftRosterService.fetchShiftDetails(shiftId),
    enabled: !!shiftId, // Only run the query if shiftId is defined
  });
};

export const shiftQuery = {
  useShiftRoster,
  useShiftDetail,
};
