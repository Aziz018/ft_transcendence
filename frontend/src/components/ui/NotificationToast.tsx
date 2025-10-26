import Fuego from "../../index";
import { useState } from "../../library/hooks/useState";
import { useEffect } from "../../library/hooks/useEffect";

interface Notification {
  id: string;
  type:
    | "friend_request"
    | "friend_accepted"
    | "friend_declined"
    | "message"
    | "info"
    | "error";
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification, action: string) => void;
}

const NotificationToast = ({
  notifications,
  onDismiss,
  onAction,
}: NotificationToastProps) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-[#1a1a1a] border border-[#b7f272] rounded-lg p-4 shadow-lg animate-slide-in-right">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {notification.type === "friend_request" && (
                  <span className="text-2xl">👋</span>
                )}
                {notification.type === "friend_accepted" && (
                  <span className="text-2xl">✅</span>
                )}
                {notification.type === "friend_declined" && (
                  <span className="text-2xl">❌</span>
                )}
                {notification.type === "message" && (
                  <span className="text-2xl">💬</span>
                )}
                {notification.type === "info" && (
                  <span className="text-2xl">ℹ️</span>
                )}
                {notification.type === "error" && (
                  <span className="text-2xl">⚠️</span>
                )}
                <h4 className="text-[#f9f9f9] font-semibold text-sm">
                  {notification.title}
                </h4>
              </div>
              <p className="text-[#878787] text-xs mb-3">
                {notification.message}
              </p>

              {notification.type === "friend_request" && onAction && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAction(notification, "accept")}
                    className="px-3 py-1.5 bg-[#b7f272] rounded-lg text-black text-xs font-medium hover:bg-[#b7f272]/90 transition-colors">
                    Accept
                  </button>
                  <button
                    onClick={() => onAction(notification, "decline")}
                    className="px-3 py-1.5 bg-[#ff4141] rounded-lg text-white text-xs font-medium hover:bg-[#ff4141]/90 transition-colors">
                    Decline
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onDismiss(notification.id)}
              className="text-[#878787] hover:text-[#f9f9f9] transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
