import Fuego from "../index";
import {
  notificationService,
  Notification,
} from "../services/notificationService";

export function useNotifications() {
  const [notifications, setNotifications] = Fuego.useState<Notification[]>([]);

  Fuego.useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev: any) => {
        // Ensure prev is always an array
        const prevArray = Array.isArray(prev) ? prev : [];

        if (notification.title === "removed") {
          // Remove notification
          return prevArray.filter((n: any) => n.id !== notification.id);
        } else {
          // Add or update notification
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

  // Ensure notifications is always an array
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
