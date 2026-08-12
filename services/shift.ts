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

/** Wave-10: prefer POST; legacy GET remains on API for older clients.
 * Wave-11: optional accuracy / exceptionReason for server geofence. */
const clockIn = async (
  userId: string,
  shiftId: number,
  latitude: number,
  longitude: number,
  options?: { accuracy?: number; exceptionReason?: string }
) => {
  const params = new URLSearchParams({
    userId: String(userId),
    shiftId: String(shiftId),
    lat: String(latitude),
    lng: String(longitude),
    medium: "Mobile",
  });
  if (options?.accuracy != null && Number.isFinite(options.accuracy)) {
    params.set("accuracy", String(options.accuracy));
  }
  if (options?.exceptionReason) {
    params.set("exceptionReason", options.exceptionReason);
  }
  return axiosInstance.post(`/Attendances/clock_in?${params.toString()}`);
};
const clockOut = async (
  userId: string,
  shiftId: number,
  latitude: number,
  longitude: number,
  options?: { accuracy?: number; exceptionReason?: string }
) => {
  const params = new URLSearchParams({
    userId: String(userId),
    shiftId: String(shiftId),
    lat: String(latitude),
    lng: String(longitude),
    medium: "Mobile",
  });
  if (options?.accuracy != null && Number.isFinite(options.accuracy)) {
    params.set("accuracy", String(options.accuracy));
  }
  if (options?.exceptionReason) {
    params.set("exceptionReason", options.exceptionReason);
  }
  return axiosInstance.post(`/Attendances/clock_out?${params.toString()}`);
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
