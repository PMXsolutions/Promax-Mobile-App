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

export const profileService = {
  fetchStaffProfile,
  fetchCompanyData,
  handleEditStaffProfile,
};
