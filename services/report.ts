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
const fetchStaffDocument = async (staffId: number) => {
  try {
    const { data } = await axiosInstance.get(
      `/Documents/get_all_staff_documents?staffId=${staffId}`
    );
    return data.staffDocuments;
  } catch (error) {
    throw new Error("Unable to fetch shift documents");
  }
};

export const reportService = {
  fetchStaffReport,
  fetchReportInfo,
  handleEditShiftForm,
  fetchStaffDocument,
};
