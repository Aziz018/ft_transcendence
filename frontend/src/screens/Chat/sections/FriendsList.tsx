/**
 * Friends List Sidebar
 * Shows list of friends with online status and search
 */

import React, { useState, useEffect, useCallback } from "react";
import { chatService, type Friend } from "../../../services/chatService";
import { getToken } from "../../../lib/auth";
import { wsService } from "../../../services/wsService";

const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=FF6B35&color=fff&size=128";

/**
 * Get proper avatar URL - handles both backend URLs and fixes incorrect paths
 */
const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  const backend =
    (import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api";

  if (!avatarPath || !avatarPath.trim()) {
    return defaultAvatar;
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

  return defaultAvatar;
};

interface FriendsListProps {
  onSelectFriend: (friend: Friend) => void;
  selectedFriend: Friend | null;
}

const FriendsList = ({ onSelectFriend, selectedFriend }: FriendsListProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>(
    {}
  );
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [friendToUnfriend, setFriendToUnfriend] = useState<Friend | null>(null);

  /**
   * Load friends list
   */
  const loadFriends = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[FriendsList] No auth token found");
        return;
      }

      const fetchedFriends = await chatService.getFriends(token);
      setFriends(fetchedFriends);
    } catch (error) {
      console.error("[FriendsList] Failed to load friends:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle online status updates
   */
  const handleOnlineStatus = useCallback(
    (userId: string, isOnline: boolean) => {
      setOnlineStatuses((prev) => ({
        ...prev,
        [userId]: isOnline,
      }));
    },
    []
  );

  /**
   * Filter friends by search query
   */
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Initialize: Load friends and subscribe to status updates
   */
  useEffect(() => {
    loadFriends();

    const unsubscribeStatus = chatService.onOnlineStatus(handleOnlineStatus);

    const unsubscribeAccepted = wsService.on(
      "friend_request_accepted",
      (payload: any) => {
        console.log(
          "[FriendsList] Friend request accepted (WebSocket), reloading friends list:",
          payload
        );

        loadFriends();
      }
    );

    const handleLocalAccept = () => {
      console.log(
        "[FriendsList] Friend request accepted (local), reloading friends list"
      );
      loadFriends();
    };
    window.addEventListener("friendRequestAccepted", handleLocalAccept);

    return () => {
      unsubscribeStatus();
      unsubscribeAccepted();
      window.removeEventListener("friendRequestAccepted", handleLocalAccept);
    };
  }, [loadFriends, handleOnlineStatus]);

  /**
   * Block a friend
   */
  const handleBlockFriend = useCallback(
    async (friend: Friend, e: MouseEvent) => {
      e.stopPropagation();

      if (!confirm(`Are you sure you want to block ${friend.name}?`)) {
        return;
      }

      try {
        const token = getToken();
        if (!token) return;

        await chatService.blockUser(friend.id, token);

        setFriends((prev) => prev.filter((f) => f.id !== friend.id));

        if (selectedFriend?.id === friend.id) {
          onSelectFriend(null as any);
        }
      } catch (error) {
        console.error("[FriendsList] Failed to block friend:", error);
        alert("Failed to block user. Please try again.");
      }
    },
    [selectedFriend, onSelectFriend]
  );

  /**
   * Unfriend a user
   */
  const handleUnfriend = useCallback(
    async (friend: Friend, e: MouseEvent) => {
      e.stopPropagation();
      setFriendToUnfriend(friend);
      setShowUnfriendModal(true);
    },
    []
  );

  const confirmUnfriend = useCallback(
    async () => {
      if (!friendToUnfriend) return;

      setShowUnfriendModal(false);

      try {
        const token = getToken();
        if (!token) return;

        await chatService.unfriend(friendToUnfriend.id, token);

        setFriends((prev) => prev.filter((f) => f.id !== friendToUnfriend.id));

        if (selectedFriend?.id === friendToUnfriend.id) {
          onSelectFriend(null as any);
        }

        setFriendToUnfriend(null);
      } catch (error) {
        console.error("[FriendsList] Failed to unfriend:", error);
        alert("Failed to remove friend. Please try again.");
      }
    },
    [friendToUnfriend, selectedFriend, onSelectFriend]
  );

  return (
    <div className="w-full bg-white/5 border-r border-white/10 flex flex-col h-full">
      {/* Header - Always visible */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex-shrink-0">
        <h2 className="text-white font-[Questrial] text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          Messages
        </h2>

        {/* Search - Always visible, touch-friendly */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full min-h-[44px] bg-white/10 text-white placeholder-white/40 rounded-full px-4 py-2 pl-10 font-[Questrial] text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors touch-manipulation"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Friends List - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-6">
              <div className="text-4xl mb-2">😔</div>
              <p className="text-white/40 font-[Questrial] text-sm">
                {searchQuery ? "No friends found" : "No friends yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {filteredFriends.map((friend) => {
              const isOnline =
                onlineStatuses[friend.id] || friend.status === "ONLINE";
              const isSelected = selectedFriend?.id === friend.id;

              return (
                <div
                  key={friend.id}
                  onClick={() => onSelectFriend(friend)}
                  className={`px-4 sm:px-6 py-3 min-h-[72px] cursor-pointer transition-all duration-200 group relative touch-manipulation active:bg-white/10 ${
                    isSelected
                      ? "bg-blue-600/20 border-l-4 border-blue-600"
                      : "hover:bg-white/5 border-l-4 border-transparent"
                  }`}>
                  <div className="flex items-center gap-3">
                    {/* Avatar - Touch-friendly size */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={getAvatarUrl(friend.avatar)}
                        alt={friend.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/20 bg-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = defaultAvatar;
                        }}
                      />
                    </div>

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-[Questrial] text-sm sm:text-base font-semibold truncate">
                        {friend.name}
                      </h3>
                      <p className="text-white/50 font-[Questrial] text-xs sm:text-sm truncate">
                        {friend.email}
                      </p>
                    </div>

                    {/* Actions (show on hover/touch) - Touch-friendly buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e: any) => handleUnfriend(friend, e)}
                        className="min-w-[44px] min-h-[44px] p-2 hover:bg-red-500/20 active:bg-red-500/30 rounded-full transition-colors touch-manipulation"
                        title="Unfriend">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e: any) => handleBlockFriend(friend, e)}
                        className="min-w-[44px] min-h-[44px] p-2 hover:bg-red-500/20 active:bg-red-500/30 rounded-full transition-colors touch-manipulation"
                        title="Block">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Total friends counter - Always visible */}
      <div className="px-4 sm:px-6 py-3 border-t border-white/10 flex-shrink-0">
        <p className="text-white/50 font-[Questrial] text-xs sm:text-sm">
          {filteredFriends.length} {filteredFriends.length === 1 ? 'friend' : 'friends'}
        </p>
      </div>

      {/* Unfriend Confirmation Modal */}
      {showUnfriendModal && friendToUnfriend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1c1e] rounded-2xl shadow-2xl border border-white/10 max-w-md w-full p-6 space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-[Questrial] text-lg font-semibold">
                  Unfriend {friendToUnfriend.name}?
                </h3>
                <p className="text-white/50 text-sm font-[Questrial]">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Message */}
            <p className="text-white/70 font-[Questrial] text-sm leading-relaxed">
              Are you sure you want to remove <span className="text-white font-semibold">{friendToUnfriend.name}</span> from your friends list? 
              You'll need to send a new friend request to reconnect.
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowUnfriendModal(false);
                  setFriendToUnfriend(null);
                }}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-[Questrial] font-medium text-sm transition-all border border-white/10 hover:border-white/20">
                Cancel
              </button>
              <button
                onClick={confirmUnfriend}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-[Questrial] font-semibold text-sm transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30">
                Unfriend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
