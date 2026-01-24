
export interface Notification {
  id: string;
  type: "info" | "success" | "error" | "warning" | "friend-request" | "game-invite";
  message: string;
  title?: string;
  duration?: number;
  data?: any; // For friend request: { requestId, requesterName, requesterId, requesterAvatar }
}

type NotificationListener = (notification: Notification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private notifications: Map<string, Notification> = new Map();
  private notificationTimers: Map<string, NodeJS.Timeout> = new Map();

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(notification: Omit<Notification, "id">) {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    this.notifications.set(id, fullNotification);

    this.listeners.forEach((listener) => {
      try {
        listener(fullNotification);
      } catch (e) {
        console.error("Error in notification listener:", e);
      }
    });

    if (fullNotification.duration && fullNotification.duration > 0) {
      const timer = setTimeout(() => {
        this.remove(id);
      }, fullNotification.duration);

      this.notificationTimers.set(id, timer);
    }

    return id;
  }

  remove(id: string) {
    this.notifications.delete(id);

    const timer = this.notificationTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.notificationTimers.delete(id);
    }

    this.listeners.forEach((listener) => {
      try {
        listener({
          id,
          type: "info",
          message: "",
          title: "removed",
        });
      } catch (e) {
        console.error("Error in notification listener:", e);
      }
    });
  }

  friendRequest(data: {
    requestId: string;
    requesterName: string;
    requesterId: string;
    requesterAvatar: string;
    requesterEmail?: string;
  }) {
    return this.notify({
      type: "friend-request",
      title: "Friend Request",
      message: `${data.requesterName} sent you a friend request`,
      duration: 0, // Don't auto-dismiss friend requests
      data,
    });
  }

  gameInvite(data: {
    inviterId: string;
    inviterName: string;
    title?: string;
  }) {
    return this.notify({
      type: "game-invite",
      title: data.title || "Game Invite",
      message: `${data.inviterName} invited you to play Pong!`,
      duration: 0, // Don't auto-dismiss game invites - user must respond
      data,
    });
  }

  success(message: string, duration?: number) {
    return this.notify({
      type: "success",
      message,
      duration,
    });
  }

  error(message: string, duration?: number) {
    return this.notify({
      type: "error",
      message,
      duration,
    });
  }

  info(message: string, duration?: number) {
    return this.notify({
      type: "info",
      message,
      duration,
    });
  }

  warning(message: string, duration?: number) {
    return this.notify({
      type: "warning",
      message,
      duration,
    });
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }
}

export const notificationService = new NotificationService();
