import axiosInstance from "@/libs/axiosInstance";
import { ShiftReport } from "@/types/report";

const fetchStaffReport = async (staffId: number) => {
  try {
    const { data } = await axiosInstance.get(
      `/ShiftReports/get_staff_shiftreports?staffId=${staffId}`
    );
    return data;
  } catch (error) {
    throw new Error("Unable to fetch shift reports");
  }
};
const fetchReportInfo = async (reportId: number, shiftId: number) => {
  try {
    const response = await axiosInstance.get(
      `/ShiftReports/get_shiftreport_details/${reportId}?shiftId=${shiftId}`
    );

    return response.data;
  } catch (error) {
    throw new Error("Unable to fetch report details");
  }
};

const handleEditShiftForm = async (
  shiftReportId: number,
  userId: string,
  formInfo: ShiftReport
) => {
  return axiosInstance.post(
    `/ShiftReports/edit/${shiftReportId}?userId=${userId}`,
    formInfo
  );
};

export const reportService = {
  fetchStaffReport,
  fetchReportInfo,
  handleEditShiftForm,
};
