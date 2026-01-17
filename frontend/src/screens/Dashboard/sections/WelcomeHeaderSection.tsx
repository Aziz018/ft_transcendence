import Fuego from "../../../index";

import { BellIcon, SearchIcon } from "lucide-react";
import NotificationBell from "../../../assets/notification.svg";
import SecondaryButton from "../../../components/ui/SecondaryButton";
import { getToken, decodeTokenPayload } from "../../../lib/auth";
import { useEffect } from "../../../library/hooks/useEffect";
import { useState } from "../../../library/hooks/useState";
import { useCallback } from "../../../library/hooks/useCallback";
import { notificationService } from "../../../services/notificationService";
import FriendRequestNotifications from "../../../components/Dashboard/FriendRequestNotifications";
import { useTheme } from "../../../context/ThemeContext";

const WelcomeHeaderSection = () => {
  const { theme, toggleTheme } = useTheme();

  const getAvatarUrl = (avatarPath: string | null | undefined): string => {
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ccircle cx='100' cy='70' r='35' fill='%23d1d5db'/%3E%3Cpath d='M 50 180 Q 50 140 100 140 Q 150 140 150 180' fill='%23d1d5db'/%3E%3C/svg%3E";

    if (!avatarPath || !avatarPath.trim()) {
      return defaultAvatar;
    }

    if (avatarPath.startsWith("/public/")) {
      return `/api${avatarPath}`;
    }

    if (avatarPath.startsWith("/")) {
      return `/api${avatarPath}`;
    }

    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }

    return defaultAvatar;
  };

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (name && name !== "Guest") {
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = getToken();

        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/v1/user/profile`, {
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
  }, []);

  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = getToken();

      const res = await fetch(
        `/api/v1/user/search?q=${encodeURIComponent(trimmedQuery)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Search failed:", res.statusText);
        return;
      }

      const data = await res.json();
      setSearchResults(data.users || []);
      setShowResults(true);
    } catch (error) {
      console.error("[Search] Failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleAddFriend = useCallback(async (userId: string) => {
    try {
      const token = getToken();

      const res = await fetch(`/api/v1/friend/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requested_uid: userId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();

        if (res.status === 409) {
          notificationService.warning(
            error.message || "Friend request already sent",
            4000
          );
        } else if (res.status === 403) {
          notificationService.error(
            error.message || "Cannot send friend request",
            4000
          );
        } else if (res.status === 400) {
          notificationService.error(error.message || "Invalid user", 3000);
        } else {
          notificationService.error(
            error.message || "Failed to send friend request",
            4000
          );
        }
        return;
      }

      notificationService.success("Friend request sent successfully!", 3000);

      setSearchResults((prev) => prev.filter((u) => u.uid !== userId));
    } catch (error) {
      console.error("[AddFriend] Failed:", error);
      notificationService.error("Failed to send friend request", 4000);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.warn("[Notifications] No token available");
          return;
        }

        const backend = (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3000";

        const res = await fetch(`${backend}/v1/friend/incoming`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          let errorMsg = `HTTP ${res.status}`;
          try {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const errorData = await res.json();
              errorMsg = errorData?.message || errorData?.error || errorMsg;
            } else {
              const text = await res.text();
              errorMsg = text || errorMsg;
            }
          } catch (parseErr) {
            console.error("[Notifications] Could not parse error response", parseErr);
          }
          console.error(`[Notifications] Request failed: ${errorMsg}`);
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          console.error(`[Notifications] Expected JSON but got ${contentType}`);
          return;
        }

        const data = await res.json();
        setNotificationCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("[Notifications] Network or parsing error:", error);
      }
    };

    fetchNotificationCount();

    const unsubscribe = notificationService.subscribe((notification) => {
      if (
        notification.type === "friend-request" &&
        notification.title !== "removed"
      ) {
        setNotificationCount((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <header className="w-full flex items-start justify-between gap-4 bg-transparent">
      <div className="flex flex-col gap-6">
        <p className="[font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-base tracking-[0] leading-[15px]">
          Here&apos;s what&apos;s waiting for you today.
        </p>

        <h1 className="[font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-4xl tracking-[0] leading-[15px] whitespace-nowrap">
          Welcome Back, {name}!
        </h1>
      </div>

      <div className="flex items-center gap-[10px]">
        <div className="relative w-[300px]">
          <input
            type="text"
            placeholder="Search users (e.g., 'aziz')..."
            value={searchQuery}
            onInput={(e: any) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="flex h-10 w-full rounded-md border border-[#f9f9f933] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#1f1f1f] border border-[#f9f9f933] rounded-md shadow-lg max-h-[300px] overflow-y-auto z-50">
              {searchResults.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-3 hover:bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover bg-gray-700"
                      onError={(e) => {
                        const backend =
                          (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
                          "http://localhost:3001";
                        console.error(
                          "Failed to load avatar:",
                          e.currentTarget.src
                        );
                        e.currentTarget.src = `${backend}/images/default-avatar.png`;
                      }}
                    />
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/50 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFriend(user.uid)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}

          {showResults &&
            !isSearching &&
            searchQuery &&
            searchResults.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-[#1f1f1f] border border-[#f9f9f933] rounded-md shadow-lg p-4 z-50">
                <p className="text-white/50 text-center">No users found</p>
              </div>
            )}

          {isSearching && (
            <div className="absolute top-full mt-2 w-full bg-[#1f1f1f] border border-[#f9f9f933] rounded-md shadow-lg p-4 z-50">
              <p className="text-white/50 text-center">Searching...</p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            variant="outline"
            size="icon"
            className="relative flex items-center justify-center h-10 w-[43px] rounded-[14px] border border-solid border-[#f9f9f933] bg-transparent hover:bg-white/5 transition-colors">
            <img
              src={NotificationBell}
              alt="bell icon"
              className="w-[22px] h-[22px]"
            />
            {notificationCount > 0 && (
              <span className="absolute top-[6px] right-[9px] z-[1] min-w-[16px] h-[16px] bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <FriendRequestNotifications
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onCountChange={(count) => setNotificationCount(count)}
          />
        </div>

        <button
          onClick={toggleTheme}
          className="h-10 px-[18px] bg-accent-orange hover:bg-accent-orange/90 rounded-[14px] border border-solid border-[#f9f9f933] font-questrial font-normal text-light text-sm tracking-[0] leading-[15px] transition-all duration-300 flex items-center gap-2">
          <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </header>
  );
};

export default WelcomeHeaderSection;
