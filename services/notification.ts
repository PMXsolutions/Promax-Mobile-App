import axiosInstance from "@/libs/axiosInstance";

const fetchNotification = async (user: string) => {
  try {
    const response = await axiosInstance.get(`/Messages/inbox?userId=${user}`);

    return response.data.message;
  } catch (error) {
    throw new Error("Unable to fetch message");
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
