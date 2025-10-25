/**
 * Friend Request Notifications Component
 * Displays incoming friend requests in a dropdown from the notification bell
 */

import Fuego from "../../index";
import { useState } from "../../library/hooks/useState";
import { useEffect } from "../../library/hooks/useEffect";
import { useCallback } from "../../library/hooks/useCallback";
import { getToken } from "../../lib/auth";
import { notificationService } from "../../services/notificationService";
import { wsService } from "../../services/wsService";

interface FriendRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterAvatar: string;
  timestamp: Date;
}

interface FriendRequestNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

const FriendRequestNotifications = ({
  isOpen,
  onClose,
  onCountChange,
}: FriendRequestNotificationsProps) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  /**
   * Get proper avatar URL
   */
  const getAvatarUrl = (avatarPath: string | null | undefined): string => {
    const backend =
      (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3001";

    if (!avatarPath || !avatarPath.trim()) {
      return `${backend}/images/default-avatar.png`;
    }

    if (avatarPath.startsWith("/public/")) {
      return `${backend}${avatarPath.replace("/public", "")}`;
    }

    if (avatarPath.startsWith("/")) {
      return `${backend}${avatarPath}`;
    }

    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }

    return `${backend}/images/default-avatar.png`;
  };

  /**
   * Fetch incoming friend requests from backend
   */
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3001";

      const res = await fetch(`${backend}/v1/friend/incoming`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friend requests");
      }

      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);

      // Notify parent of count change
      if (onCountChange) {
        onCountChange(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("[FriendRequests] Failed to fetch:", error);
      notificationService.error("Failed to load friend requests", 3000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle accepting a friend request
   */
  const handleAccept = useCallback(
    async (requestId: string, requesterId: string, requesterName: string) => {
      try {
        setProcessingIds((prev) => new Set(prev).add(requestId));
        const token = getToken();
        const backend =
          (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
          "http://localhost:3001";

        const res = await fetch(`${backend}/v1/friend/respond`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: requestId,
            action: true, // true = accept
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to accept friend request");
        }

        // Remove from local state
        setRequests((prev) => {
          const newRequests = prev.filter((req) => req.id !== requestId);
          // Notify parent of count change
          if (onCountChange) {
            onCountChange(newRequests.length);
          }
          return newRequests;
        });

        // Emit event to notify other components (e.g., chat friends list)
        // This allows the chat to update immediately when accepting a request
        window.dispatchEvent(
          new CustomEvent("friendRequestAccepted", {
            detail: { requesterId, requesterName },
          })
        );

        // Show success notification
        notificationService.success(
          `You are now friends with ${requesterName}!`,
          3000
        );
      } catch (error) {
        console.error("[FriendRequests] Failed to accept:", error);
        notificationService.error("Failed to accept friend request", 3000);
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    []
  );

  /**
   * Handle rejecting a friend request
   */
  const handleReject = useCallback(
    async (requestId: string, requesterName: string) => {
      try {
        setProcessingIds((prev) => new Set(prev).add(requestId));
        const token = getToken();
        const backend =
          (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
          "http://localhost:3001";

        const res = await fetch(`${backend}/v1/friend/respond`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: requestId,
            action: false, // false = reject
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to reject friend request");
        }

        // Remove from local state
        setRequests((prev) => {
          const newRequests = prev.filter((req) => req.id !== requestId);
          // Notify parent of count change
          if (onCountChange) {
            onCountChange(newRequests.length);
          }
          return newRequests;
        });

        // Show info notification
        notificationService.info(
          `Declined request from ${requesterName}`,
          3000
        );
      } catch (error) {
        console.error("[FriendRequests] Failed to reject:", error);
        notificationService.error("Failed to reject friend request", 3000);
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    []
  );

  /**
   * Fetch requests when dropdown opens
   */
  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen, fetchRequests]);

  /**
   * Listen for new friend requests via WebSocket/notification service
   */
  useEffect(() => {
    // Subscribe to friend request notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      if (
        notification.type === "friend-request" &&
        notification.data &&
        notification.title !== "removed"
      ) {
        // Add new request to the list
        const newRequest: FriendRequest = {
          id: notification.data.requestId,
          requesterId: notification.data.requesterId,
          requesterName: notification.data.requesterName,
          requesterEmail: notification.data.requesterEmail || "",
          requesterAvatar: notification.data.requesterAvatar || "",
          timestamp: new Date(),
        };

        setRequests((prev) => {
          // Avoid duplicates
          if (prev.some((req) => req.id === newRequest.id)) {
            return prev;
          }
          return [newRequest, ...prev];
        });
      }
    });

    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1a1a] border border-[#f9f9f933] rounded-lg shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#f9f9f933]">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">
              Friend Requests
            </h3>
            <span className="text-white/50 text-xs">
              {requests.length} pending
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-white/50 text-sm">Loading...</div>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="text-white/30 text-4xl mb-2">👥</div>
              <p className="text-white/50 text-sm text-center">
                No pending friend requests
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f9f9f933]">
              {requests.map((request) => {
                const isProcessing = processingIds.has(request.id);

                return (
                  <div
                    key={request.id}
                    className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <img
                        src={getAvatarUrl(request.requesterAvatar)}
                        alt={request.requesterName}
                        className="w-12 h-12 rounded-full object-cover bg-gray-700 flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {request.requesterName}
                        </p>
                        <p className="text-white/50 text-xs truncate">
                          {request.requesterEmail}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() =>
                              handleAccept(
                                request.id,
                                request.requesterId,
                                request.requesterName
                              )
                            }
                            disabled={isProcessing}
                            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors font-medium">
                            {isProcessing ? "..." : "Accept"}
                          </button>
                          <button
                            onClick={() =>
                              handleReject(request.id, request.requesterName)
                            }
                            disabled={isProcessing}
                            className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors font-medium">
                            {isProcessing ? "..." : "Decline"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FriendRequestNotifications;
