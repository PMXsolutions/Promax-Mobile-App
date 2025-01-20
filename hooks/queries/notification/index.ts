import { useFocusNotifyOnChangeProps } from "@/helpers/notifyOnFocus";
import { notificationService } from "@/services/notification";
import { NotificationType } from "@/types/notication";
import { useQuery } from "@tanstack/react-query";

const useNotification = (user: string) => {
  const notifyOnChangeProps = useFocusNotifyOnChangeProps();
  return useQuery<NotificationType[]>({
    queryKey: ["notifications"],
    queryFn: () => notificationService.fetchNotification(user),
    notifyOnChangeProps,
    // refetchOnWindowFocus: false,
    // staleTime: 300000, // 5 minutes
    enabled: !!user, // Only run the query if staffId is defined
  });
};
const useNotificationDetail = (messageId: number) => {
  const notifyOnChangeProps = useFocusNotifyOnChangeProps();
  return useQuery<NotificationType>({
    queryKey: ["notification", { id: messageId }],
    queryFn: () => notificationService.fetchNotificationDetail(messageId),
    notifyOnChangeProps,
    // refetchOnWindowFocus: false,
    // staleTime: 300000, // 5 minutes
    enabled: !!messageId, // Only run the query if staffId is defined
  });
};

export const notificationQuery = {
  useNotification,
  useNotificationDetail,
};
