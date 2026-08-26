import axiosInstance from "@/libs/axiosInstance";

const fetchNotification = async (user: string) => {
  try {
    const response = await axiosInstance.get(
      `/Messages/inbox?userId=${encodeURIComponent(user)}`
    );
    const payload = response.data?.message ?? response.data?.Message ?? [];
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    throw new Error("Unable to fetch inbox messages");
  }
};

const fetchNotificationDetail = async (messageId: number) => {
  try {
    const { data } = await axiosInstance.get(`/Messages/${messageId}`);
    return data;
  } catch (error) {
    throw new Error("Unable to fetch message");
  }
};

const deleteNotification = async (messageId: number) => {
  const response = await axiosInstance.post(`/Messages/delete/${messageId}`);
  return response;
};

export const notificationService = {
  fetchNotification,
  fetchNotificationDetail,
  deleteNotification,
};
