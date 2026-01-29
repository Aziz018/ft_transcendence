import React from "react";
import {
  notificationService,
  Notification,
} from "../services/notificationService";

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {

    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev: any) => {

        const prevArray = Array.isArray(prev) ? prev : [];

        if (notification.title === "removed") {

          return prevArray.filter((n: any) => n.id !== notification.id);
        } else {

          const exists = prevArray.find((n: any) => n.id === notification.id);
          if (exists) {
            return prevArray.map((n: any) =>
              n.id === notification.id ? notification : n
            );
          }
          return [...prevArray, notification];
        }
      });
    });

    return unsubscribe;
  }, []);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return {
    notifications: safeNotifications,
    notify: notificationService.notify.bind(notificationService),
    remove: notificationService.remove.bind(notificationService),
    friendRequest: notificationService.friendRequest.bind(notificationService),
    success: notificationService.success.bind(notificationService),
    error: notificationService.error.bind(notificationService),
    info: notificationService.info.bind(notificationService),
    warning: notificationService.warning.bind(notificationService),
  };
}
