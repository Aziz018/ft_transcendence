import Fuego from "../../index";
import { Notification } from "../../services/notificationService";
import Mason from "../../assets/1.svg";

interface ToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const Toast = ({ notification, onRemove }: ToastProps) => {
  const getBackgroundColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-[#10b981]";
      case "error":
        return "bg-[#ef4444]";
      case "warning":
        return "bg-[#f59e0b]";
      case "friend-request":
        return "bg-[#8b5cf6]";
      case "info":
      default:
        return "bg-[#3b82f6]";
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "friend-request":
        return "👤";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm pointer-events-auto hover:shadow-xl transition-shadow`}>
      <span className="text-xl font-bold">{getIcon()}</span>

      <div className="flex-1">
        {notification.title && (
          <div className="font-semibold text-sm">{notification.title}</div>
        )}
        <div className="text-sm">{notification.message}</div>
      </div>

      {notification.type === "friend-request" && notification.data && (
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => {

              onRemove(notification.id);
            }}
            className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition-colors">
            ✓
          </button>
          <button
            onClick={() => {

              onRemove(notification.id);
            }}
            className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition-colors">
            ✕
          </button>
        </div>
      )}

      {notification.type !== "friend-request" && (
        <button
          onClick={() => onRemove(notification.id)}
          className="ml-2 text-white/70 hover:text-white transition-colors">
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
