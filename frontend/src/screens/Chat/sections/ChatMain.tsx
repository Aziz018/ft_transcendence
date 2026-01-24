import Fuego from "../../../index";
import { useState } from "../../../library/hooks/useState";
import { useEffect } from "../../../library/hooks/useEffect";
import { useCallback } from "../../../library/hooks/useCallback";
import { useRef } from "../../../library/hooks/useRef";
import {
  chatService,
  type Message,
  type Friend,
} from "../../../services/chatService";
import { decodeTokenPayload, getToken } from "../../../lib/auth";
import { wsService } from "../../../services/wsService";
import { Link, redirect } from "../../../library/Router/Router";

const defaultAvatar = `${(import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api"
  }/images/default-avatar.png`;

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

interface ChatMainProps {
  selectedFriend: Friend | null;
}

const ChatMain = ({ selectedFriend }: ChatMainProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // Track locally disabled invites (clicked accept/reject)
  const [disabledInvites, setDisabledInvites] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!selectedFriend) return;

    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[ChatMain] No auth token found");
        return;
      }

      const fetchedMessages = await chatService.getMessages(
        selectedFriend.id,
        token
      );
      setMessages(fetchedMessages);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("[ChatMain] Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFriend, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedFriend || !newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setIsSending(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[ChatMain] No auth token found");
        return;
      }

      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        senderId: "me", // This will be replaced by actual ID or handled by isMe logic
        receiverId: selectedFriend.id,
        createdAt: new Date().toISOString(),
        sender: {
          id: "me",
          name: "You",
        },
      };

      // We don't add optimistic message to state immediately to avoid duplication
      // because we now receive the message back via WebSocket for synchronization.
      // However, for better UX, we can add it and then replace/deduplicate it.
      // But since we have the duplication issue, let's rely on the WebSocket/Response
      // or handle the duplication check strictly.

      // Let's add it optimistically, but mark it as temporary.
      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom();

      chatService
        .sendMessage(selectedFriend.id, messageContent, token)
        .then((sentMessage) => {
          // Replace optimistic message with real one
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === optimisticMessage.id ? sentMessage : msg
            )
          );
        })
        .catch((error) => {
          console.error("[ChatMain] Failed to send message:", error);
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== optimisticMessage.id)
          );
          setNewMessage(messageContent);
        })
        .finally(() => {
          setIsSending(false);
        });
    } catch (error) {
      console.error("[ChatMain] Failed to send message:", error);
      setIsSending(false);
    }
  }, [selectedFriend, newMessage, isSending, scrollToBottom]);

  const handlePlayInvite = useCallback(async () => {
    if (!selectedFriend) return;

    try {
      const token = getToken();
      if (!token) {
        console.error("[ChatMain] No auth token found");
        return;
      }

      // Use WS to send invite for better notification handling
      wsService.sendGameAction("game_invite", { targetId: selectedFriend.id });

      // Check if we need to manually persist invite to localStorage or if we rely on WS echo
      // The backend echo will handle the chat message display

      localStorage.setItem(
        "pendingGameInvite",
        JSON.stringify({
          opponentId: selectedFriend.id,
          opponentName: selectedFriend.name,
          opponentAvatar: selectedFriend.avatar,
          timestamp: Date.now(),
        })
      );

      redirect("/game");
    } catch (error) {
      console.error("[ChatMain] Failed to send game invitation:", error);
      alert("Failed to send game invitation. Please try again.");
    }
  }, [selectedFriend]);

  const handleBlockUser = useCallback(async () => {
    if (!selectedFriend) return;

    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "/api";
      const token = getToken();

      if (!token) {
        console.error("[ChatMain] No auth token found");
        return;
      }

      const response = await fetch(`${backend}/v1/friend/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocked_uid: selectedFriend.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to block user");
      }

      alert(`Blocked ${selectedFriend.name}`);
      setShowMenu(false);

      window.location.reload();
    } catch (error) {
      console.error("[ChatMain] Failed to block user:", error);
      alert("Failed to block user. Please try again.");
    }
  }, [selectedFriend]);

  const handleUnfriend = useCallback(async () => {
    if (!selectedFriend) return;

    const confirmed = confirm(
      `Are you sure you want to unfriend ${selectedFriend.name}?`
    );
    if (!confirmed) return;

    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "/api";
      const token = getToken();

      if (!token) {
        console.error("[ChatMain] No auth token found");
        return;
      }

      const response = await fetch(`${backend}/v1/friend/unfriend`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requested_uid: selectedFriend.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unfriend");
      }

      alert(`Unfriended ${selectedFriend.name}`);
      setShowMenu(false);

      window.location.reload();
    } catch (error) {
      console.error("[ChatMain] Failed to unfriend:", error);
      alert("Failed to unfriend. Please try again.");
    }
  }, [selectedFriend]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleNewMessage = useCallback(
    (message: Message) => {
      if (
        selectedFriend &&
        (message.senderId === selectedFriend.id ||
          message.receiverId === selectedFriend.id)
      ) {
        setMessages((prev) => {
          // Check if message already exists (by ID) - If so, UPDATE it (e.g. for expiration)
          const existingIndex = prev.findIndex((msg) => msg.id === message.id);
          if (existingIndex !== -1) {
            const newMessages = [...prev];
            // Only update if content changed/different? Or just overwrite.
            // Overwriting is safer for updates like "Expired"
            newMessages[existingIndex] = message;
            return newMessages;
          }

          // Check if we have a temp message that matches this one (by content and timestamp proximity)
          // This is a heuristic to deduplicate optimistic messages if the ID replacement didn't happen yet
          // or if the WebSocket message arrived before the HTTP response.
          // However, the HTTP response handler replaces the temp ID with the real ID.
          // If the WebSocket message comes with the real ID, we should check if that real ID is already there.
          // We already did that above.

          // Now check if there is a temp message that we should replace with this incoming real message
          // This happens if WS is faster than HTTP response
          const tempMsgIndex = prev.findIndex(msg => msg.id.startsWith('temp-') && msg.content === message.content);

          if (tempMsgIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempMsgIndex] = message;
            return newMessages;
          }

          return [...prev, message];
        });
        scrollToBottom();
      }
    },
    [selectedFriend, scrollToBottom]
  );

  useEffect(() => {
    if (!selectedFriend) return;

    loadMessages();

    const unsubscribe = chatService.onMessage(handleNewMessage);

    // Listen for game start instruction (for Inviter and Acceptor)
    const unsubscribeGame = chatService.onGameStart(() => {
      redirect('/game');
    });

    const token = getToken();
    if (token) {
      chatService.connectWebSocket(token);
    }

    return () => {
      unsubscribe();
      unsubscribeGame();
    };
  }, [selectedFriend, loadMessages, handleNewMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (!selectedFriend) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl text-white/60 font-[Questrial]">
            Select a friend to start chatting
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden bg-[#141517]">
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <img
          src={getAvatarUrl(selectedFriend.avatar)}
          alt={selectedFriend.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-white/20 bg-gray-700"
          onError={(e) => {
            e.currentTarget.src = defaultAvatar;
          }}
        />
        <div className="flex-1">
          <h2 className="text-white font-[Questrial] text-lg font-semibold">
            {selectedFriend.name}
          </h2>
          <p className="text-white/50 text-sm font-[Questrial]">
            {selectedFriend.status === "ONLINE" ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </span>
            ) : (
              "Offline"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayInvite}
            className="px-6 py-2.5 bg-accent-green hover:bg-accent-green/90 text-dark-950 rounded-lg font-[Questrial] font-semibold text-sm transition-all shadow-[0_0_20px_rgba(183,242,114,0.3)] hover:shadow-[0_0_30px_rgba(183,242,114,0.5)] flex items-center gap-2">
            <span className="text-lg">🎮</span>
            Let's Play
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10 hover:border-white/20 flex items-center justify-center">
              <div className="flex flex-col gap-1">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </div>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-dark-900 border border-white/10 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-fadeIn">
                <button
                  onClick={handleBlockUser}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors font-[Questrial] text-sm flex items-center gap-3 border-b border-white/5">
                  <span className="text-lg">🚫</span>
                  Block User
                </button>
                <button
                  onClick={handleUnfriend}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors font-[Questrial] text-sm flex items-center gap-3">
                  <span className="text-lg">💔</span>
                  Unfriend
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth min-h-0"
        style={{ scrollBehavior: "smooth" }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-white/40 font-[Questrial]">
                No messages yet. Say hello!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.senderId !== selectedFriend.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"
                  } animate-fadeIn`}>
                <div
                  className={`flex gap-3 max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"
                    }`}>
                  {!isMe && (
                    <img
                      src={getAvatarUrl(selectedFriend.avatar)}
                      alt={selectedFriend.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-gray-700"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                  )}

                  <div
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"
                      }`}>
                    <div
                      className={`w-fit max-w-full break-words rounded-2xl p-4 ${isMe
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white/10 text-white rounded-tl-none"
                        }`}>
                      {message.content.includes("🎮 Game Invitation") ? (
                        <div className="flex flex-col gap-3">
                          <p className="font-[Questrial] text-sm">{message.content}</p>

                          {!isMe && !message.content.includes("(Expired)") && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setDisabledInvites(prev => new Set(prev).add(message.id));
                                  wsService.sendGameAction("accept_game_invite", { inviterId: message.senderId });
                                  // Redirect happens via game_start_instruction or manually
                                }}
                                disabled={disabledInvites.has(message.id)}
                                className="bg-accent-green text-dark-950 px-4 py-2 rounded-lg font-bold hover:bg-accent-green/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                Accept & Play
                              </button>
                              <button
                                onClick={() => {
                                  setDisabledInvites(prev => new Set(prev).add(message.id));
                                  wsService.sendGameAction("reject_game", { targetId: message.senderId });
                                }}
                                disabled={disabledInvites.has(message.id)}
                                className="bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                Reject
                              </button>
                            </div>
                          )}
                          {message.content.includes("(Expired)") && (
                            <span className="text-xs text-white/40 italic">Invitation Expired</span>
                          )}
                        </div>
                      ) : (
                        <p className="font-[Questrial] text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                      <span className="text-[10px] opacity-50 mt-1 block text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e: any) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress as any}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-full px-6 py-3 font-[Questrial] text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full px-6 py-3 font-[Questrial] text-sm font-semibold transition-all duration-200 disabled:opacity-50">
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div >
  );
};

export default ChatMain;
