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
const useShiftDetail = (shiftId: number, enabled = true) => {
  return useQuery<ShiftRosterType>({
    queryKey: ["shifts", "detail", { id: shiftId }],
    queryFn: () => ShiftRosterService.fetchShiftDetails(shiftId),
    enabled: Number.isFinite(shiftId) && shiftId > 0 && enabled,
  });
};

export const shiftQuery = {
  useShiftRoster,
  useShiftDetail,
};
