import Fuego from "../../../index";

import { BellIcon, SearchIcon } from "lucide-react";
// import { Button } from "../../../../components/ui/button";
// import { Input } from "../../../components/ui/input";
import NotificationBell from "../../../assets/notification.svg";
import SecondaryButton from "../../../components/ui/SecondaryButton";
import { getToken, decodeTokenPayload } from "../../../lib/auth";
import { useEffect } from "../../../library/hooks/useEffect";
import { useState } from "../../../library/hooks/useState";
import ArrowReturn from "../../../assets/arrow-return.svg";
import { redirect } from "../../../library/Router/Router";
import { wsService } from "../../../services/websocket";
import NotificationToast from "../../../components/ui/NotificationToast";

const WelcomeHeaderSection = () => {
  const deriveNameFromToken = () => {
    try {
      const token = getToken();
      if (!token) return "Guest";
      const payload = decodeTokenPayload(token);
      if (payload?.name) return payload.name;
      if (payload?.given_name) return payload.given_name;
      if (payload?.email) {
        const local = String(payload.email).split("@")[0] || payload.email;
        const parts = local
          .replace(/[._+-]+/g, " ")
          .split(/\s+/)
          .filter(Boolean)
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1));
        return parts.join(" ") || payload.email;
      }
      return "Guest";
    } catch (e) {
      return "Guest";
    }
  };

  const [name, setName] = useState<string>(deriveNameFromToken());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [toastNotifications, setToastNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    if (!wsService.isConnected()) {
      wsService.connect();
    }

    // Handle incoming friend requests
    const handleFriendRequest = (data: any) => {
      console.log("Friend request received:", data);

      // Add to incoming requests
      fetchIncomingRequests();

      // Show toast notification
      const notification = {
        id: data.requestId || Math.random().toString(),
        type: "friend_request",
        title: "New Friend Request",
        message: `${data.senderName} wants to be your friend!`,
        timestamp: new Date(),
        data: data,
      };

      setToastNotifications((prev: any[]) => [...prev, notification]);

      // Play notification sound
      playNotificationSound();
    };

    // Handle friend request accepted
    const handleFriendAccepted = (data: any) => {
      console.log("Friend request accepted:", data);

      const notification = {
        id: Math.random().toString(),
        type: "friend_accepted",
        title: "Friend Request Accepted",
        message: `${data.friendName} accepted your friend request!`,
        timestamp: new Date(),
        data: data,
      };

      setToastNotifications((prev: any[]) => [...prev, notification]);
      playNotificationSound();
    };

    // Handle friend request declined
    const handleFriendDeclined = (data: any) => {
      console.log("Friend request declined:", data);

      const notification = {
        id: Math.random().toString(),
        type: "friend_declined",
        title: "Friend Request Declined",
        message: `${data.declinedBy} declined your friend request.`,
        timestamp: new Date(),
        data: data,
      };

      setToastNotifications((prev: any[]) => [...prev, notification]);
    };

    wsService.on("friend_request_received", handleFriendRequest);
    wsService.on("friend_request_accepted", handleFriendAccepted);
    wsService.on("friend_request_declined", handleFriendDeclined);

    return () => {
      wsService.off("friend_request_received", handleFriendRequest);
      wsService.off("friend_request_accepted", handleFriendAccepted);
      wsService.off("friend_request_declined", handleFriendDeclined);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8PVKvi7q5aGAg+ltryxnMpBSh+zPLaizsIGGS57OihUQ0NTKXi8LJZHAY7k9jyyHkwBSuBzvLaizYIGWi78OScTgwNU6zk77BdGwc7ltjyxnQpBSiAzPDaizsIGmW57OihUQ0PU6ri7q5aGAhAl9vyxnMpBSh/zPLajDsJGWS56+mjUg4PUqri7qxbGAhAltvyxnMpBSh+zPPaizsIG2W56+mjUg4PUqvj7axbGAg/ltrzxnMpBSh+zPPajDsJG2S46+mjUg4PUqvi7axaGAg+ltrzxnQoBSh+zPPajDsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4PUqvi7axaGAg+ltvzxnMoBSh+zPPajTsJGmW46+mjUg4P"
      );
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      console.log("Could not play notification sound");
    }
  };

  const handleDismissNotification = (id: string) => {
    setToastNotifications((prev: any[]) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationAction = async (
    notification: any,
    action: string
  ) => {
    if (notification.type === "friend_request" && notification.data) {
      await respondToFriendRequest(
        notification.data.requestId,
        action === "accept"
      );

      // Refresh incoming requests after accepting/declining
      fetchIncomingRequests();

      // Dismiss the notification
      handleDismissNotification(notification.id);
    }
  };
  useEffect(() => {
    if (name && name !== "Guest") {
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          redirect("/");
          return;
        }

        const backend =
          (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
          "http://localhost:3000";

        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${backend}/v1/user/profile`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        let data: any = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          return;
        }
        if (data?.name) {
          setName(data.name);
        }
      } catch (e) {
        console.error("Failed to fetch profile:", e);
      }
    };
    fetchProfile();
    fetchIncomingRequests();
  }, []);

  const searchUsers = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = getToken();
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";

      const response = await fetch(
        `${backend}/v1/user/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const token = getToken();
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";

      const response = await fetch(`${backend}/v1/friend/incoming`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (response.ok) {
        const requests = await response.json();
        setIncomingRequests(requests || []);
      }
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      const token = getToken();
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";

      const response = await fetch(`${backend}/v1/friend/respond`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify({
          request_id: requestId,
          action: accept,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          accept ? "Friend request accepted!" : "Friend request declined!"
        );
        // Refresh incoming requests to update the UI
        fetchIncomingRequests();
      } else {
        const error = await response.json();
        console.error("Failed to respond to friend request:", error.message);
        alert(error.message || "Failed to respond to friend request");
      }
    } catch (error) {
      console.error("Error responding to friend request:", error);
      alert("Failed to respond to friend request");
    }
  };

  const sendFriendRequest = async (userId: string, userName: string) => {
    try {
      const token = getToken();
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";

      const response = await fetch(`${backend}/v1/friend/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify({ requested_uid: userId }),
      });

      if (response.ok) {
        alert(
          `Friend request sent to ${userName}! They will receive a notification.`
        );
        setShowSearchDropdown(false);
        setSearchQuery("");
        setSearchResults([]);
        // Refresh notifications for the receiver (they'll see it on their next load/refresh)
      } else {
        const error = await response.json();

        // Handle specific error cases with user-friendly messages
        if (response.status === 409) {
          if (error.message.includes("already friends")) {
            alert(`You're already friends with ${userName}!`);
          } else if (error.message.includes("already sent")) {
            alert(`You already sent a friend request to ${userName}!`);
          } else if (error.message.includes("already sent you")) {
            alert(
              `${userName} already sent you a friend request! Check your notifications.`
            );
          } else {
            alert(
              `You already sent a friend request to ${userName} or you're already friends!`
            );
          }
        } else if (response.status === 400) {
          alert(error.message || "Invalid request");
        } else if (response.status === 403) {
          alert(error.message || "Cannot send friend request");
        } else {
          alert(error.message || "Failed to send friend request");
        }
      }
    } catch (error) {
      console.error("Friend request error:", error);
      alert("Failed to send friend request");
    }
  };

  const handleSearchChange = (e: any) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchUsers(value);
  };

  return (
    <>
      <NotificationToast
        notifications={toastNotifications}
        onDismiss={handleDismissNotification}
        onAction={handleNotificationAction}
      />

      <header className="bg-r ed-500 w-full flex items-start justify-between gap-4 bg-transparent">
        <button onClick={() => redirect("/chat")}>
          <div className="flex flex- col gap -6 bg-light rounded-[14px] p-4 cursor-pointer hover:opacity-90 transition-colors duration-150">
            <div>
              <img src={ArrowReturn} alt="ArrowReturn icon" className="" />
            </div>
            <div>
              <img src={ArrowReturn} alt="ArrowReturn icon" className="" />
            </div>
          </div>
        </button>

        <div className="flex items-center gap-[10px]">
          <div className="relative w-[300px]">
            <input
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full h-full rounded-[14px] border-[1px] border-[#878782] p-3 bg-transparent pl-4 pr-12 [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-sm placeholder:text-[#878787] focus:outline-none"
            />

            {showSearchDropdown && (
              <div className="absolute top-full mt-2 w-full max-h-[300px] overflow-y-auto bg-[#1a1a1a] border border-[#878782] rounded-[14px] shadow-lg z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-[#878787]">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.uid}
                      className="p-3 hover:bg-[#2a2a2a] border-b border-[#333] last:border-b-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#dda15e] flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="text-[#f9f9f9] font-medium">
                            {user.name}
                          </div>
                          <div className="text-[#878787] text-xs">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.uid, user.name)}
                        className="px-3 py-1.5 bg-[#dda15e] rounded-lg text-white text-sm hover:bg-[#dda15e]/90 transition-colors">
                        Add Friend
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#878787]">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              variant="outline"
              size="icon"
              className="relative flex items-center justify-center h-10 w-[43px] rounded-[14px] border border-solid border-[#f9f9f933] bg-transparent hover:bg-transparent">
              <img
                src={NotificationBell}
                alt="bell icon"
                className="w-[22px] h-[22px]"
              />
              {/* Notification count badge */}
              {incomingRequests.length > 0 && (
                <span className="absolute top-[6px] right-[10px] z-[1] min-w-[16px] h-[16px] px-1 bg-[#b7f272] rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold text-black">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-[320px] max-h-[400px] overflow-y-auto bg-[#1a1a1a] border border-[#878782] rounded-[14px] shadow-lg z-50">
                <div className="p-3 border-b border-[#333]">
                  <h3 className="text-[#f9f9f9] font-semibold">
                    Friend Requests
                  </h3>
                </div>

                {incomingRequests.length > 0 ? (
                  incomingRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className="p-3 hover:bg-[#2a2a2a] border-b border-[#333] last:border-b-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-[#dda15e] flex items-center justify-center text-white font-bold">
                            {request.requesterName?.charAt(0).toUpperCase() ||
                              "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[#f9f9f9] font-medium truncate">
                              {request.requesterName}
                            </div>
                            <div className="text-[#878787] text-xs truncate">
                              {request.requesterEmail}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              respondToFriendRequest(request.id, true)
                            }
                            className="px-2 py-1 bg-[#b7f272] rounded-lg text-black text-xs hover:bg-[#b7f272]/90 transition-colors font-medium">
                            ✓
                          </button>
                          <button
                            onClick={() =>
                              respondToFriendRequest(request.id, false)
                            }
                            className="px-2 py-1 bg-[#ff4141] rounded-lg text-white text-xs hover:bg-[#ff4141]/90 transition-colors font-medium">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#878787]">
                    No pending friend requests
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="h-10 px-[18px] bg-[#dda15e] rounded-[14px] border border-solid border-[#f9f9f933] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-sm tracking-[0] leading-[15px] hover:bg-[#dda15e]/90">
            Switch Mode
          </button>
        </div>
      </header>
    </>
  );
};

export default WelcomeHeaderSection;
