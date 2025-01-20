import axiosInstance from "@/libs/axiosInstance";

const fetchStaffShift = async (uid: number) => {
  try {
    const { data } = await axiosInstance.get(
      `/ShiftRosters/get_shifts_by_user?client=&staff=${uid}`,
      {
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    return data?.shiftRoster;
  } catch (error) {
    throw new Error("Unable to fetch roster");
  }
};
const fetchShiftDetails = async (shiftId: number) => {
  try {
    const response = await axiosInstance.get(`/ShiftRosters/${shiftId}`, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Unable to fetch shift details");
  }
};

const clockIn = async (
  userId: string,
  shiftId: number,
  latitude: number,
  longitude: number
) => {
  return axiosInstance.get(
    `/Attendances/clock_in?userId=${userId}&shiftId=${shiftId}&lat=${latitude}&lng=${longitude}`
  );
};
const clockOut = async (userId: string, shiftId: number) => {
  return axiosInstance.get(
    `/Attendances/clock_out?userId=${userId}&shiftId=${shiftId}`
  );
};
const submitCancellationReason = async (
  user: string,
  reason: string,
  shiftid: number
) => {
  return axiosInstance.get(
    `/ShiftRosters/shift_cancellation?userId=${user}&reason=${reason}&shiftid=${shiftid}`
  );
};

export const ShiftRosterService = {
  fetchStaffShift,
  fetchShiftDetails,
  clockIn,
  clockOut,
  submitCancellationReason,
};
