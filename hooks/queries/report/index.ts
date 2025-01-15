import { reportService } from "@/services/report";
import { DocumentData, ShiftReport } from "@/types/report";
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

const useFetchStaffDocument = (staffId: number) => {
  return useQuery<DocumentData[]>({
    queryKey: ["staffDocument", staffId],
    queryFn: () => reportService.fetchStaffDocument(staffId),
    refetchOnWindowFocus: false,
    enabled: !!staffId, // Only run the query if staffId is defined
  });
};

export const reportQuery = {
  useFetchStaffReport,
  useFetchReportInfo,
  useFetchStaffDocument,
};
