import Fuego from "../../../index";
import Mason from "../../../assets/1.svg";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import PlayIcon from "../../../assets/Play.svg";
import SendMessageIcon from "../../../assets/send-icon.svg";
import MenuIcon from "../../../assets/Group 230.svg";
import ViewProfileIcon from "../../../assets/view-profile.svg";
import InviteIcon from "../../../assets/invite-icon.svg";
import UnfriendIcon from "../../../assets/unfriend-icon.svg";
import BlockUserIcon from "../../../assets/block-icon.svg";
import { getToken, decodeTokenPayload } from "../../../lib/auth";
import { useEffect } from "../../../library/hooks/useEffect";
import { wsService } from "../../../services/wsService";

const ChatWithFriendsSection = () => {
  const [isMenuOpen, setIsMenuOpen] = Fuego.useState(false);
  const [friends, setFriends] = Fuego.useState([]);
  const [selectedFriend, setSelectedFriend] = Fuego.useState(null);
  const [incomingRequests, setIncomingRequests] = Fuego.useState([]);
  const [pendingRequests, setPendingRequests] = Fuego.useState([]);
  const [messages, setMessages] = Fuego.useState<any[]>([]);
  const [messageInput, setMessageInput] = Fuego.useState("");
  const [searchQuery, setSearchQuery] = Fuego.useState("");
  const [searchResults, setSearchResults] = Fuego.useState<any[]>([]);
  const [isSearching, setIsSearching] = Fuego.useState(false);

  const backend =
    (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3001";

  useEffect(() => {
    fetchFriends();
    fetchIncomingRequests();
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.id);

      const interval = setInterval(() => {
        fetchMessages(selectedFriend.id);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedFriend]);

  useEffect(() => {

    const unsubscribeFriendRequestAccepted = wsService.on(
      "friend_request_accepted",
      (payload: any) => {
        console.log("Friend request accepted by:", payload);

        fetchFriends();
        fetchIncomingRequests();
      }
    );

    return () => {
      unsubscribeFriendRequestAccepted();
    };
  }, []);
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = getToken();
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

        const usersList = (data.users || []).map((user: any) => ({
          ...user,
          id: user.uid || user.id, // Use uid from API as id
          avatar: user.avatar && user.avatar.trim() ? user.avatar : Mason, // Use Mason as fallback
        }));
        setSearchResults(usersList);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (userId: string, userName: string) => {
    try {

      if (friends.some((f: any) => f.id === userId)) {
        alert(`You are already friends with ${userName}!`);
        return;
      }

      if (pendingRequests.some((r: any) => r.requestedId === userId)) {
        alert(`Friend request already sent to ${userName}!`);
        return;
      }

      if (incomingRequests.some((r: any) => r.requesterId === userId)) {
        alert(
          `${userName} already sent you a friend request! Accept it from the requests section.`
        );
        return;
      }

      const token = getToken();
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
        alert(`✅ Friend request sent to ${userName}!`);
        await fetchPendingRequests(); // Refresh pending requests
      } else if (response.status === 409) {
        alert(`⚠️ Friend request already exists with ${userName}!`);
        await fetchPendingRequests(); // Refresh to sync state
      } else {
        const error = await response.json();
        alert(`❌ ${error.message || "Failed to send friend request"}`);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("❌ Failed to send friend request");
    }
  };

  const handleSelectSearchResult = (user: any) => {
    setSelectedFriend(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  const fetchMessages = async (friendId: string) => {
    if (!friendId) return; // Guard clause: prevent undefined API calls

    const token = getToken();
    if (!token) {
      console.warn("No valid token, skipping message fetch");
      return;
    }

    try {

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(
        `${backend}/v1/message/direct?friend_uid=${friendId}&limit=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.status === 401) {

        console.warn("Unauthorized: Token expired");
        return;
      }

      if (response.ok) {
        const data = await response.json();

        const formattedMessages = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          sender: msg.senderName,
          avatar: msg.senderAvatar || Mason,
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: msg.isOwn,
        }));

        setMessages((prevMessages) => {
          const prevIds = prevMessages.map((m: any) => m.id).join(",");
          const newIds = formattedMessages.map((m: any) => m.id).join(",");
          if (prevIds !== newIds) {
            return formattedMessages;
          }
          return prevMessages;
        });
      }
    } catch (error) {
      if ((error as any).name !== "AbortError") {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedFriend || !content.trim()) return;

    const messageContent = content.trim();

    const token = getToken();
    const userPayload = decodeTokenPayload(token);

    const optimisticMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender_id: userPayload?.uid || "current-user",
      receiver_id: selectedFriend.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_sender: true,
      sender: userPayload?.name || "You",
      avatar: userPayload?.avatar || Mason,
      text: messageContent,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };

    setMessages((prev: any[]) => [...prev, optimisticMessage]);

    const messagesContainer = document.querySelector(
      "[data-messages-container]"
    );
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 0);
    }

    fetch(`${backend}/v1/message/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
      body: JSON.stringify({
        receiver_uid: selectedFriend.id,
        content: messageContent,
      }),
    })
      .then((response) => {
        if (response.ok) {

          setTimeout(() => {
            fetchMessages(selectedFriend.id);
          }, 300); // Reduced from 800ms to 300ms for faster refresh
          return;
        }

        return response.json().then((error) => {
          throw new Error(error?.message || "Failed to send message");
        });
      })
      .catch((error) => {
        console.error("Error sending message:", error);

        setMessages((prev: any[]) =>
          prev.filter((m) => m.id !== optimisticMessage.id)
        );

      });
  };

  const fetchFriends = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${backend}/v1/friend/friends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (response.ok) {
        const friendIds = await response.json();

        const friendsData = await Promise.all(
          (friendIds || []).map(async (friendId: string) => {
            try {
              const friendResponse = await fetch(
                `${backend}/v1/user/${friendId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                  },
                  credentials: "include",
                }
              );

              if (friendResponse.ok) {
                const friendData = await friendResponse.json();
                return {
                  id: friendId,
                  name: friendData.name || "Unknown",
                  avatar:
                    friendData.avatar && friendData.avatar.trim()
                      ? friendData.avatar
                      : Mason,
                  status: "online", // Default status, could be updated via WebSocket
                };
              }
            } catch (error) {
              console.error(`Error fetching friend ${friendId}:`, error);
            }
            return null;
          })
        );

        const validFriends = friendsData.filter((f: any) => f !== null);
        setFriends(validFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${backend}/v1/friend/incoming`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIncomingRequests(data || []);
      }
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${backend}/v1/friend/pending`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data || []);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const respondToFriendRequest = async (
    requestId: string,
    accept: boolean,
    requesterData?: any
  ) => {
    try {
      const token = getToken();
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
        if (accept) {
          alert("✅ Friend request accepted!");

          if (requesterData) {
            const newFriend = {
              id: requesterData.requesterId,
              name: requesterData.requesterName || "Unknown",
              avatar:
                requesterData.requesterAvatar &&
                requesterData.requesterAvatar.trim()
                  ? requesterData.requesterAvatar
                  : Mason,
              status: "online",
            };
            setFriends((prevFriends: any) => [...prevFriends, newFriend]);
          } else {

            await fetchFriends();
          }
        } else {
          alert("✅ Friend request rejected!");
        }

        await fetchIncomingRequests();
      } else {
        const error = await response.json();
        alert(`❌ ${error.message || "Failed to respond to friend request"}`);
      }
    } catch (error) {
      console.error("Error responding to friend request:", error);
      alert("❌ Failed to respond to friend request");
    }
  };

  const unfriendUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to unfriend ${userName}?`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${backend}/v1/friend/unfriend`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify({ requested_uid: userId }),
      });

      if (response.ok) {
        alert(`Unfriended ${userName}`);
        fetchFriends();
        setSelectedFriend(null);
      } else {
        alert("Failed to unfriend user");
      }
    } catch (error) {
      console.error("Error unfriending user:", error);
      alert("Failed to unfriend user");
    }
  };

  const blockUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to block ${userName}?`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${backend}/v1/friend/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify({ blocked_uid: userId }),
      });

      if (response.ok) {
        alert(`Blocked ${userName}`);
        fetchFriends();
        setSelectedFriend(null);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    }
  };

  const handleMenuAction = (action: string) => {
    if (!selectedFriend) return;

    setIsMenuOpen(false);

    switch (action) {
      case "View Profile":
        console.log("View profile:", selectedFriend);
        break;
      case "Invite":
        console.log("Invite to game:", selectedFriend);
        break;
      case "Unfriend":
        unfriendUser(selectedFriend.id, selectedFriend.name);
        break;
      case "Block User":
        blockUser(selectedFriend.id, selectedFriend.name);
        break;
    }
  };

  const menuOptions = [
    { label: "View Profile", icon: ViewProfileIcon, color: "#ddf247" },
    { label: "Invite", icon: InviteIcon, color: "#ffffff" },
    { label: "Unfriend", icon: UnfriendIcon, color: "#ffffff" },
    { label: "Block User", icon: BlockUserIcon, color: "#ff4141" },
  ];

  return (
    <div className="mt-[20px] w-full h-[650px] rounded-[30px] border border-[#f9f9f9] border-opacity-[0.1] relative bg-[#0a0a0a]">
      {/* Left Sidebar - User List */}
      <div className="absolute top-0 left-0 w-[326px] h-full border-r border-[#f9f9f9] border-opacity-[0.1] p-[25px]">
        {/* Search Input */}
        <div className="relative w-full mb-[26px]">
          <div className="relative w-full h-[59px] rounded-[14px] border border-[#f9f9f9] border-opacity-[0.1] shadow-[0px_4px_4px_#00000040]">
            <input
              placeholder="Search, users..."
              value={searchQuery}
              onChange={(e: any) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setIsSearching(true)}
              className="w-full h-full rounded-[14px] border-0 bg-transparent pl-4 pr-12 [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-sm placeholder:text-[#878787] focus:outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#878787" strokeWidth="2" />
                <path
                  d="M11 11L15 15"
                  stroke="#878787"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#f9f9f9] border-opacity-[0.1] rounded-[14px] z-50 shadow-lg max-h-[300px] overflow-y-auto">
              {searchResults.map((user: any) => {
                const isFriend = friends.some((f: any) => f.id === user.id);
                return (
                  <div
                    key={user.id}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 border-b border-[#f9f9f9] border-opacity-[0.05] last:border-0">
                    <button
                      onClick={() => handleSelectSearchResult(user)}
                      className="flex-1 flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
                      <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={user.avatar || Mason}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="text-[#878787] text-xs">
                          {isFriend ? "✅ Friend" : "💬 Message"}
                        </p>
                      </div>
                    </button>
                    {!isFriend && (
                      <button
                        onClick={() => sendFriendRequest(user.id, user.name)}
                        className="px-3 py-1 bg-[#ddf247] hover:bg-[#c0d638] rounded-[6px] text-[#0a0a0a] text-xs font-medium transition-colors flex-shrink-0">
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isSearching && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#f9f9f9] border-opacity-[0.1] rounded-[14px] z-50 shadow-lg p-4">
              <p className="text-center text-[#878787] text-sm">
                No users found
              </p>
            </div>
          )}
        </div>

        {/* User List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto h-[calc(100%-85px)]">
          {/* Incoming Friend Requests */}
          {incomingRequests && incomingRequests.length > 0 && (
            <div className="mb-4">
              <p className="text-[#878787] text-xs font-medium mb-2 px-2">
                🔔 FRIEND REQUESTS ({incomingRequests.length})
              </p>
              {incomingRequests.map((request: any) => (
                <div
                  key={request.id}
                  className="w-full rounded-[14px] bg-[#8787871a] p-3 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <img
                      src={request.requesterAvatar || Mason}
                      alt={request.requesterName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium">
                        {request.requesterName}
                      </p>
                      <p className="text-[#878787] text-[10px]">
                        wants to be friends
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        respondToFriendRequest(request.id, true, request)
                      }
                      className="px-2 py-1 bg-[#ddf247] hover:bg-[#c0d638] rounded-[6px] text-[#0a0a0a] text-[10px] font-medium transition-colors">
                      ✓
                    </button>
                    <button
                      onClick={() =>
                        respondToFriendRequest(request.id, false, request)
                      }
                      className="px-2 py-1 bg-[#ff4141] hover:bg-[#e63030] rounded-[6px] text-white text-[10px] font-medium transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends List */}
          {friends && friends.length > 0 ? (
            <>
              <p className="text-[#878787] text-xs font-medium px-2">
                👥 FRIENDS ({friends.length})
              </p>
              {friends.map((friend: any, index: number) => (
                <button
                  key={friend.id || index}
                  onClick={() => setSelectedFriend(friend)}
                  className={`w-full h-[65px] rounded-[14px] flex items-center px-[19px] gap-[8px] hover:bg-[#87878733] transition-colors ${
                    selectedFriend?.id === friend.id
                      ? "bg-[#8787871a]"
                      : "bg-transparent"
                  }`}>
                  <div className="relative w-[35px] h-[35px]">
                    <img
                      src={friend.avatar || Mason}
                      alt={friend.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-0.5 items-start">
                    <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm tracking-[0] leading-[15px]">
                      {friend.name}
                    </span>
                    <span className="[font-family:'Poppins',Helvetica] font-medium text-[#878787] text-[10px] leading-[15px] tracking-[0] truncate max-w-[126px]">
                      {friend.status === "online" ? "🟢 online" : "🔘 offline"}
                    </span>
                  </div>
                </button>
              ))}
            </>
          ) : incomingRequests && incomingRequests.length === 0 ? (
            <div className="text-center text-[#878787] mt-4">
              <p className="text-sm font-medium">No friends exist</p>
              <p className="text-xs mt-2">Search for users to add friends!</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="absolute top-0 left-[326px] w-[calc(100%-326px)] h-full flex flex-col p-[23px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-[20px] pb-[20px] border-b border-[#f9f9f9] border-opacity-[0.1]">
          <div className="flex flex-col gap-1">
            <h3 className="[font-family:'Poppins',Helvetica] font-medium text-white text-2xl tracking-[0] leading-[15px]">
              {selectedFriend?.name || "👋 Looking for a friend..."}
            </h3>
            <span className="[font-family:'Questrial',Helvetica] font-normal text-[#878787] text-sm tracking-[0] leading-[15px] pt-2">
              {selectedFriend
                ? selectedFriend.status || "online"
                : "Select someone to chat with"}
            </span>
          </div>

          {selectedFriend && (
            <div className="flex items-center gap-2">
              {/* Let's Play Button */}
              <button className="flex items-center justify-center gap-[5px] border-solid px-8 py-2 rounded-[14px] border border-white hover:opacity-80 transition-colors">
                <img src={PlayIcon} alt="Mason" className="w-4 h-4" />
                <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-xs tracking-[0] leading-[15px]">
                  Let's play
                </span>
              </button>
              {/* Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-80 rounded-full transition-colors">
                  <img src={MenuIcon} alt="Menu" className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-12 w-[124px] bg-[#232323] border-0 rounded-[14px] p-[13px] z-10 shadow-lg">
                    {menuOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleMenuAction(option.label)}
                        className="flex items-center gap-[7px] p-0 mb-[9px] last:mb-0 cursor-pointer hover:opacity-80 transition-opacity w-full">
                        <img
                          src={option.icon}
                          alt={option.label}
                          className="w-[14px] h-[14px]"
                        />
                        <span
                          style={{ color: option.color }}
                          className="[font-family:'Questrial',Helvetica] font-normal text-[11px] text-center tracking-[0] leading-[17px]">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div
          data-messages-container
          className="flex-1 overflow-y-auto mb-[20px] flex flex-col gap-[29px] items-center justify-center">
          {!selectedFriend ? (
            <div className="text-center">
              <p className="[font-family:'Questrial',Helvetica] font-normal text-[#878787] text-xl tracking-[0] leading-[15px]">
                👋 Looking for a friend...
              </p>
              <p className="[font-family:'Questrial',Helvetica] font-normal text-[#878787] text-sm tracking-[0] leading-[15px] mt-2">
                Select a friend from the list to start chatting
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center">
              <p className="[font-family:'Questrial',Helvetica] font-normal text-[#878787] text-xl tracking-[0] leading-[15px]">
                No messages yet
              </p>
              <p className="[font-family:'Questrial',Helvetica] font-normal text-[#878787] text-sm tracking-[0] leading-[15px] mt-2">
                Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isOwn ? "justify-end" : "justify-start"
                } w-full`}>
                {!msg.isOwn && (
                  <img
                    src={msg.avatar || Mason}
                    alt={msg.sender}
                    className="w-10 h-10 rounded-full object-cover mr-2"
                  />
                )}
                <div
                  className={`max-w-xs ${
                    msg.isOwn
                      ? "bg-[#f9f9f9] rounded-[14px_14px_0px_14px]"
                      : "bg-[#141517] rounded-[14px_14px_14px_0px]"
                  } p-[12px_13px]`}>
                  <span
                    className={`[font-family:'Questrial',Helvetica] font-normal text-base tracking-[0] leading-[15px] block mb-1.5 ${
                      msg.isOwn ? "text-[#0a0a0a]" : "text-white"
                    }`}>
                    {msg.sender}
                  </span>
                  <p
                    className={`[font-family:'Questrial',Helvetica] font-normal text-[11px] tracking-[0] leading-5 mb-2 ${
                      msg.isOwn ? "text-[#0a0a0a]" : "text-white"
                    }`}>
                    {msg.text}
                  </p>
                  <span
                    className={`[font-family:'Questrial',Helvetica] font-normal text-[11px] tracking-[0] leading-[15px] float-right ${
                      msg.isOwn ? "text-[#0a0a0a]" : "text-white"
                    }`}>
                    {msg.time}
                  </span>
                </div>
                {msg.isOwn && (
                  <img
                    src={msg.avatar || Mason}
                    alt={msg.sender}
                    className="w-10 h-10 rounded-full object-cover ml-2"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="relative w-full h-[50px]">
          <input
            placeholder={
              selectedFriend ? "Your message" : "Select a friend to chat"
            }
            value={messageInput}
            onChange={(e: any) => setMessageInput(e.target.value)}
            onKeyPress={(e: any) => {
              if (e.key === "Enter" && messageInput.trim() && selectedFriend) {
                e.preventDefault();
                const content = messageInput;

                setMessageInput("");

                setTimeout(() => {
                  sendMessage(content);
                }, 0);
              }
            }}
            disabled={!selectedFriend}
            className="w-full h-full bg-[#8787871a] rounded-[14px] border-0 pl-4 pr-14 [font-family:'Poppins',Helvetica] font-medium text-white text-[11px] placeholder:text-[#878787] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            disabled={!selectedFriend || !messageInput.trim()}
            onClick={(e: any) => {
              e.preventDefault();
              if (messageInput.trim()) {
                const content = messageInput;

                setMessageInput("");

                setTimeout(() => {
                  sendMessage(content);
                }, 0);
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-[34px] h-[34px] flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
            <img src={SendMessageIcon} alt="Send" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithFriendsSection;
