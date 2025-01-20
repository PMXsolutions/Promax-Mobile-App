import axiosInstance from "@/libs/axiosInstance";
import { ReportFormState, ShiftReport } from "@/types/report";
import { DocumentPickerAsset } from "expo-document-picker";

interface reqBodyType {
  docFile: DocumentPickerAsset | null;
  companyId: number | undefined;
  docuName: string;
  expirationDate: string;
  staffName: string | undefined;
}

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
      `/ShiftReports/get_shiftreport_details/${reportId}?shiftId=${shiftId}`,
      {
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Unable to fetch report details");
  }
};

const submitShiftForm = async (userId: string, formInfo: ReportFormState) => {
  return axiosInstance.post(
    `/ShiftReports/add_shiftreport?userId=${userId}`,
    formInfo
  );
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

const handleUploadStaffDocument = async (
  staffId: number,
  userId: string,
  formInfo: reqBodyType
) => {
  const formData = new FormData();

  if (formInfo?.docFile) {
    formData.append("DocumentFile", {
      uri: formInfo.docFile.uri, // Use the URI of the file
      name: formInfo.docFile.name, // Use the filename
      type: formInfo.docFile.mimeType, // Use the MIME type
    } as unknown as Blob);
  }
  formData.append("CompanyId", formInfo.companyId?.toString() as string); // Using optional chaining and nullish coalescing
  formData.append("DocumentName", formInfo.docuName);
  formData.append("ExpirationDate", formInfo.expirationDate);
  formData.append("User", formInfo?.staffName as string);
  formData.append("Status", "Pending");
  formData.append("UserRole", "Staff");
  formData.append("UserId", staffId.toString());

  return axiosInstance.post(
    `/Documents/add_document?userId=${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const reportService = {
  fetchStaffReport,
  fetchReportInfo,
  handleEditShiftForm,
  fetchStaffDocument,
  handleUploadStaffDocument,
  submitShiftForm,
};
