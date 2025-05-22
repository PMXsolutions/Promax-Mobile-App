import { FormEditType, FormSubmitType } from "@/hooks/mutation/availability";
import axiosInstance from "@/libs/axiosInstance";
import { StaffProfile } from "@/types/auth";

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

  if (formInfo?.imageFile) {
    formData.append(
      "imageFile",
      {
        uri: formInfo.imageFile, // The URI of the image
        name: "photo.jpg", // The file name
        type: "image/jpeg", // The MIME type of the image
      } as unknown as Blob // Cast the object as `Blob` for TypeScript
    );
  }
  // if (formInfo.signatureFile) {
  //   formData.append(
  //     "signatureFile",
  //     {
  //       uri: formInfo.signatureFile, // The URI of the image
  //       name: "signature.png",
  //       type: "image/png",
  //     } as unknown as Blob // Cast the object as `Blob` for TypeScript
  //   );
  // }
  console.log("FormInfowithsignature", formInfo.signatureFile);
  // console.log(formInfo);
  for (const key in formInfo) {
    const value = formInfo[key as keyof typeof formInfo];
    if (value === null) {
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
