import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  chatService,
  type Message,
  type Friend,
} from "../../../services/chatService";
import { decodeTokenPayload, getToken } from "../../../lib/auth";
import { wsService } from "../../../services/wsService";
import { Link, redirect } from "../../../router";

// Invite status type
type InviteStatus = 'idle' | 'sending' | 'sent' | 'error';

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
  onBack?: () => void;
}

const ChatMain = ({ selectedFriend, onBack }: ChatMainProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  // Track locally disabled invites (clicked accept/reject)
  const [disabledInvites, setDisabledInvites] = useState<Set<string>>(new Set());
  // Game invite sent status
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>('idle');
  const [invitedFriendName, setInvitedFriendName] = useState("");
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

      // Check WebSocket is connected BEFORE sending
      if (!wsService.isConnected()) {
        console.warn("[ChatMain] wsService not connected, trying to connect...");
        try {
          await wsService.connect();
        } catch (e) {
          console.error("[ChatMain] Failed to connect wsService:", e);
        }
      }

      setInviteStatus('sending');
      setInvitedFriendName(selectedFriend.name);
      
      console.log(`[ChatMain] Sending game invite to ${selectedFriend.name} (id: ${selectedFriend.id})`);

      // Send game invite via chatService (the primary chat WebSocket)
      chatService.sendWebSocketMessage("game_invite", { targetId: selectedFriend.id });

      // Store pending invite info for when we get game_matched
      localStorage.setItem(
        "pendingGameInvite",
        JSON.stringify({
          opponentId: selectedFriend.id,
          opponentName: selectedFriend.name,
          opponentAvatar: selectedFriend.avatar,
          timestamp: Date.now(),
        })
      );

      // Show pretty notification instead of alert
      setInviteStatus('sent');
      
      // Auto-hide after 30 seconds (invite timeout)
      setTimeout(() => {
        setInviteStatus('idle');
      }, 30000);
      
      // DON'T redirect immediately - wait for game_matched event
      // The redirect will happen when the other player accepts
      // and we receive game_matched from the backend
    } catch (error) {
      console.error("[ChatMain] Failed to send game invitation:", error);
      setInviteStatus('error');
      setTimeout(() => setInviteStatus('idle'), 5000);
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

      setSuccessMessage(`Successfully blocked ${selectedFriend.name}`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      setShowMenu(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("[ChatMain] Failed to block user:", error);
      alert("Failed to block user. Please try again.");
    }
  }, [selectedFriend]);

  const handleUnfriend = useCallback(async () => {
    if (!selectedFriend) return;

    setShowUnfriendModal(true);
  }, [selectedFriend]);

  const confirmUnfriend = useCallback(async () => {
    if (!selectedFriend) return;

    setShowUnfriendModal(false);

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

      setSuccessMessage(`Successfully removed ${selectedFriend.name} from your friends`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
      setShowMenu(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
    const unsubscribeGame = chatService.onGameStart((payload) => {
      console.log("[ChatMain] Game start instruction received:", payload);
      if (payload.gameId) {
        localStorage.setItem("pendingGameId", payload.gameId);
      }
      redirect('/game');
    });
    
    // Listen for game_matched event (triggered when invite is accepted)
    // This ensures we have the gameId before navigating to /game
    const handleGameMatched = (data: any) => {
      console.log("[ChatMain] 🎮 GAME MATCHED received:", data);
      const matchData = data.payload || data;
      if (matchData.gameId) {
        console.log("[ChatMain] Storing gameId:", matchData.gameId);
        localStorage.setItem("pendingGameId", matchData.gameId);
        // Store opponent info as well
        localStorage.setItem("pendingGameInvite", JSON.stringify({
          opponentId: matchData.opponentId,
          opponentName: matchData.opponentName,
          opponentAvatar: matchData.opponentAvatar,
          side: matchData.side,
          isBotGame: matchData.isBotGame
        }));
        // Navigate to game with room ID
        const gameUrl = `/game/${matchData.gameId}`;
        console.log("[ChatMain] Redirecting to:", gameUrl);
        redirect(gameUrl);
      }
    };
    
    // Listen on both wsService and via emit from chatService
    wsService.on('game_matched', handleGameMatched);
    
    // Listen for game invite declined (e.g., player is busy)
    const handleGameInviteDeclined = (data: any) => {
      console.log("[ChatMain] Game invite declined:", data);
      if (data.reason === 'busy') {
        alert(`Unable to send invite: ${data.message || 'Player is currently busy'}`);
        localStorage.removeItem("pendingGameInvite");
      }
    };
    
    wsService.on('game_invite_declined', handleGameInviteDeclined);

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
      {/* Game Invite Sent Notification */}
      {inviteStatus !== 'idle' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
          <div className={`px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm flex items-center gap-4 ${
            inviteStatus === 'sent' 
              ? 'bg-accent-green/20 border-accent-green/50 text-accent-green' 
              : inviteStatus === 'sending'
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
            {inviteStatus === 'sending' && (
              <>
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-[Questrial] font-medium">Sending invite...</span>
              </>
            )}
            {inviteStatus === 'sent' && (
              <>
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="font-[Questrial] font-semibold">Game invite sent to {invitedFriendName}!</p>
                  <p className="text-sm opacity-80">Waiting for them to accept...</p>
                </div>
                <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin ml-2"></div>
              </>
            )}
            {inviteStatus === 'error' && (
              <>
                <span className="text-2xl">❌</span>
                <span className="font-[Questrial] font-medium">Failed to send invite. Please try again.</span>
              </>
            )}
            <button 
              onClick={() => setInviteStatus('idle')}
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Back button for mobile */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden min-w-[44px] min-h-[44px] p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors touch-manipulation flex-shrink-0"
            aria-label="Back to friends list">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <img
          src={getAvatarUrl(selectedFriend.avatar)}
          alt={selectedFriend.name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/20 bg-gray-700 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = defaultAvatar;
          }}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-[Questrial] text-base sm:text-lg font-semibold truncate">
            {selectedFriend.name}
          </h2>
          <p className="text-white/50 text-xs sm:text-sm font-[Questrial] truncate">
            {selectedFriend.email}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={handlePlayInvite}
            disabled={inviteStatus === 'sending' || inviteStatus === 'sent'}
            className={`hidden sm:flex px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-[Questrial] font-semibold text-xs sm:text-sm transition-all items-center gap-2 min-h-[44px] touch-manipulation ${
              inviteStatus === 'sending' || inviteStatus === 'sent'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-accent-green hover:bg-accent-green/90 text-dark-950 shadow-[0_0_20px_rgba(183,242,114,0.3)] hover:shadow-[0_0_30px_rgba(183,242,114,0.5)]'
            }`}>
            {inviteStatus === 'sending' ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : inviteStatus === 'sent' ? (
              <>
                <span className="text-lg">⏳</span>
                Waiting...
              </>
            ) : (
              <>
                <span className="text-lg">🎮</span>
                Let's Play
              </>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="min-w-[44px] min-h-[44px] p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg transition-all border border-white/10 hover:border-white/20 flex items-center justify-center touch-manipulation">
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
                  className="w-full min-h-[44px] px-4 py-3 text-left text-white hover:bg-white/10 active:bg-white/20 transition-colors font-[Questrial] text-sm flex items-center gap-3 border-b border-white/5 touch-manipulation">
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
        className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3 sm:space-y-4 scroll-smooth min-h-0"
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
                  className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"
                    }`}>
                  {!isMe && (
                    <img
                      src={getAvatarUrl(selectedFriend.avatar)}
                      alt={selectedFriend.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 bg-gray-700"
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

                          {!isMe && !message.content.includes("(Expired)") && !message.content.includes("(Accepted)") && !message.content.includes("(Rejected)") && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setDisabledInvites(prev => new Set(prev).add(message.id));
                                  // Set pending flag for RECEIVER as well to prevent auto-join public queue
                                  localStorage.setItem("pendingGameInvite", "true");
                                  // Send 'accept_game' with 'senderId' (the person who sent the invite)
                                  // The game_matched listener will handle storing gameId and navigating
                                  chatService.sendWebSocketMessage("accept_game", { senderId: message.senderId });
                                  // Note: Navigation happens via game_matched listener, not here
                                }}
                                disabled={disabledInvites.has(message.id)}
                                className="bg-accent-green text-dark-950 px-4 py-2 rounded-lg font-bold hover:bg-accent-green/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                Accept & Play
                              </button>
                              <button
                                onClick={() => {
                                  setDisabledInvites(prev => new Set(prev).add(message.id));
                                  chatService.sendWebSocketMessage("reject_game", { senderId: message.senderId });
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
                          {message.content.includes("(Accepted)") && (
                            <span className="text-xs text-green-400 font-bold">Invitation Accepted</span>
                          )}
                          {message.content.includes("(Rejected)") && (
                            <span className="text-xs text-red-400 font-bold">Invitation Rejected</span>
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

      <div className="bg-white/5 border-t border-white/10 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e: any) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress as any}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 min-h-[44px] bg-white/10 text-white placeholder-white/40 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 font-[Questrial] text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 touch-manipulation"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="min-w-[44px] min-h-[44px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 font-[Questrial] text-sm font-semibold transition-all duration-200 disabled:opacity-50 touch-manipulation flex items-center justify-center">
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="hidden sm:inline">Send</span>
            )}
            {!isSending && (
              <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
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

      {/* Unfriend Confirmation Modal */}
      {showUnfriendModal && selectedFriend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
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
                  Unfriend {selectedFriend.name}?
                </h3>
                <p className="text-white/50 text-sm font-[Questrial]">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Message */}
            <p className="text-white/70 font-[Questrial] text-sm leading-relaxed">
              Are you sure you want to remove <span className="text-white font-semibold">{selectedFriend.name}</span> from your friends list? 
              You'll need to send a new friend request to reconnect.
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUnfriendModal(false)}
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

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400/20 flex items-center gap-3 min-w-[300px]">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-[Questrial] font-semibold text-sm">Success!</p>
              <p className="font-[Questrial] text-sm text-white/90">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default ChatMain;
