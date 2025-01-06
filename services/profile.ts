import axiosInstance from "@/libs/axiosInstance";

const fetchStaffProfile = async (staffId: number) => {
  try {
    const { data } = await axiosInstance.get(`/Staffs/${staffId}`);
    return data;
  } catch (error) {
    throw new Error("Unable to fetch shift details");
  }
};

export const profileService = {
  fetchStaffProfile,
};
