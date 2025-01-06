import { reportService } from "@/services/report";
import { ShiftReport } from "@/types/report";
import { useQuery } from "@tanstack/react-query";

const useFetchStaffReport = (staffId: number) => {
  return useQuery<ShiftReport[]>({
    queryKey: ["staffReports", staffId],
    queryFn: () => reportService.fetchStaffReport(staffId),
    refetchOnWindowFocus: false,
    enabled: !!staffId, // Only run the query if staffId is defined
  });
};
const useFetchReportInfo = (reportId: number, shiftId: number) => {
  return useQuery<ShiftReport>({
    queryKey: ["staffReport", reportId, shiftId],
    queryFn: () => reportService.fetchReportInfo(reportId, shiftId),
    enabled: !!shiftId, // Only run the query if id and uid are defined
  });
};

export const reportQuery = {
  useFetchStaffReport,
  useFetchReportInfo,
};
