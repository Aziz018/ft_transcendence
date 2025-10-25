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
import { getToken } from "../../../lib/auth";

const defaultAvatar = `${
  (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3001"
}/images/default-avatar.png`;

const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  const backend =
    (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3001";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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

    setIsSending(true);
    try {
      const token = getToken();
      if (!token) {
        console.error("[ChatMain] No auth token found");
        return;
      }

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        senderId: "me",
        receiverId: selectedFriend.id,
        createdAt: new Date().toISOString(),
        sender: {
          id: "me",
          name: "You",
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom();

      chatService
        .sendMessage(selectedFriend.id, messageContent, token)
        .then((sentMessage) => {
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
          if (prev.some((msg) => msg.id === message.id)) {
            return prev;
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

    const token = getToken();
    if (token) {
      chatService.connectWebSocket(token);
    }

    return () => {
      unsubscribe();
    };
  }, [selectedFriend, loadMessages, handleNewMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

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
    <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden">
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
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                } animate-fadeIn`}>
                <div
                  className={`flex gap-3 max-w-[70%] ${
                    isMe ? "flex-row-reverse" : "flex-row"
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
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isMe
                          ? "bg-blue-600 text-white"
                          : "bg-white/10 text-white backdrop-blur-sm"
                      } break-words`}>
                      <p className="font-[Questrial] text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-white/40 mt-1 font-[Questrial]">
                      {formatTime(message.createdAt)}
                    </span>
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
            onKeyPress={handleKeyPress as any}
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
    </div>
  );
};

export default ChatMain;
