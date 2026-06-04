import { FormEditType, FormSubmitType } from "@/hooks/mutation/availability";
import axiosInstance from "@/libs/axiosInstance";
import { StaffProfile } from "@/types/auth";
import { saveBase64AsFile } from "@/utils/file-utils";
import { Platform } from "react-native";

const fetchStaffProfile = async (staffId: number) => {
  try {
    const { data } = await axiosInstance.get(`/Staffs/${staffId}`);
    return data;
  } catch (error) {
    throw new Error("Unable to fetch shift details");
  }
};
const fetchCompanyData = async (companyId: number) => {
  try {
    const { data } = await axiosInstance.get(
      `/Companies/get_company/${companyId}`
    );

    return data.company;
  } catch (error) {
    throw new Error("Unable to fetch company data");
  }
};

const handleEditStaffProfile = async (
  staffId: number,
  userId: string,
  formInfo: StaffProfile
) => {
  const formData = new FormData();
  const isLocalUploadUri = (uri?: string | null) =>
    Boolean(uri?.startsWith("file://") || uri?.startsWith("content://"));

  // Recently updated: only upload newly selected local images, not existing remote image URLs.
  if (isLocalUploadUri(formInfo?.imageFile)) {
    formData.append(
      "imageFile",
      {
        uri: formInfo.imageFile, // The URI of the image
        name: "photo.jpg", // The file name
        type: "image/jpeg", // The MIME type of the image
      } as unknown as Blob // Cast the object as `Blob` for TypeScript
    );
  }

  // if (
  //   formInfo.signatureFile &&
  //   formInfo.signatureFile.startsWith("data:image")
  // ) {
  //   const res = await fetch(formInfo.signatureFile);
  //   const blob = await res.blob();

  //   const file = {
  //     uri: formInfo.signatureFile,
  //     name: "signature.png",
  //     type: "image/png",
  //   };

  //   formData.append("signatureFile", file as unknown as Blob);
  // }
  if (
    formInfo.signatureFile &&
    formInfo.signatureFile.startsWith("data:image")
  ) {
    let fileUri = formInfo.signatureFile;

    if (Platform.OS === "android") {
      fileUri = await saveBase64AsFile(formInfo.signatureFile, "signature.png");
    }

    const file = {
      uri: fileUri,
      name: "signature.png",
      type: "image/png",
    };

    formData.append("signatureFile", file as any);
  }
  const fileFieldKeys = new Set(["imageFile", "signatureFile"]);

  for (const key in formInfo) {
    if (fileFieldKeys.has(key)) continue;

    const value = formInfo[key as keyof typeof formInfo];
    if (value === null || value === undefined) {
      formData.append(key, ""); // Pass empty string if value is null
    } else {
      formData.append(key, value.toString());
    }
  }

  return axiosInstance.post(
    `/Staffs/edit/${staffId}?userId=${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

const fetchStaffAvailability = async (staffId: number) => {
  try {
    const { data } = await axiosInstance.get(
      `/StaffAvailibilities/get_staff_availabilities?staffId=${staffId}`,
      {
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    return data;
  } catch (error) {
    throw new Error("Unable to fetch staff availabilty");
  }
};
const submitStaffAvailability = async (formInfo: FormSubmitType) => {
  const response = await axiosInstance.post(
    `/StaffAvailibilities/add_staff_availability?userId=${formInfo.user}`,
    {
      staffId: formInfo.staffId,
      days: formInfo.day,
      fromTimeOfDay: formInfo.newStartTime,
      toTimeOfDay: formInfo.newEndTime,
      companyID: formInfo.companyID,
    }
  );
  return response;
};
const editStaffAvailability = async (formInfo: FormEditType) => {
  return axiosInstance.post(
    `/StaffAvailibilities/edit/${formInfo?.staffAvailibilityId}?userId=${formInfo?.user}`,
    {
      staffAvailibilityId: formInfo?.staffAvailibilityId,
      staffId: formInfo?.staffId,
      days: formInfo?.days,
      fromTimeOfDay: formInfo?.fromTimeOfDay,
      toTimeOfDay: formInfo?.toTimeOfDay,
      companyID: formInfo?.companyID,
    }
  );
};

const deleteStaffAvailability = async (id: number) => {
  const response = await axiosInstance.post(
    `/StaffAvailibilities/delete/${id}`
  );
  return response;
};

export const profileService = {
  fetchStaffProfile,
  fetchCompanyData,
  handleEditStaffProfile,
  fetchStaffAvailability,
  submitStaffAvailability,
  editStaffAvailability,
  deleteStaffAvailability,
};
