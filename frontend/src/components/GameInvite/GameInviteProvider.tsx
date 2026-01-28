/**
 * GameInviteProvider.tsx
 * 
 * Global provider for game invitations using event-based approach.
 * Ensures the invite modal is always available and can be triggered from anywhere.
 */

import Fuego, { useState, useEffect } from "../../index";
import { wsService } from "../../services/wsService";
import { chatService } from "../../services/chatService";
import { redirect } from "../../library/Router/Router";
import { getToken } from "../../lib/auth";

// Types
interface GameInvite {
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  roomId?: string;
}

// Provider component - renders the global modal
export const GameInviteProvider = ({ children }: { children: any }) => {
  const [currentInvite, setCurrentInvite] = useState<GameInvite | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'pending' | 'accepting' | 'declining'>('idle');
  const [countdown, setCountdown] = useState(30);
  const [wsConnected, setWsConnected] = useState(false);

  // Ensure WebSocket is connected for receiving invites
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Connect wsService (Chat WebSocket) if not already connected
    if (!wsService.isConnected()) {
      wsService.connect()
        .then(() => {
          console.log("[GameInviteProvider] WebSocket connected");
          setWsConnected(true);
        })
        .catch(err => {
          console.error("[GameInviteProvider] WebSocket connection failed:", err);
        });
    } else {
      setWsConnected(true);
    }

    // Also connect chatService WebSocket for sending messages
    chatService.connectWebSocket(token);
  }, []);

  // Get avatar URL helper
  const getAvatarUrl = (path: string | null | undefined): string => {
    const backend = (import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api";
    if (!path || !path.trim()) return `${backend}/images/default-avatar.png`;
    if (path.startsWith("/public/")) return `${backend}${path.replace("/public", "")}`;
    if (path.startsWith("/")) return `${backend}${path}`;
    if (path.startsWith("http")) return path;
    return `${backend}/images/default-avatar.png`;
  };

  // Listen for game invites
  useEffect(() => {
    console.log("[GameInviteProvider] Setting up game_invite_received listener");
    
    const handleGameInvite = (payload: any) => {
      console.log("[GameInviteProvider] *** RECEIVED GAME INVITE ***", payload);
      
      // Don't show if already in a game or have pending invite
      if (window.location.pathname.startsWith('/game') || showInviteModal) {
        console.log("[GameInviteProvider] Ignoring invite - already busy");
        return;
      }

      setCurrentInvite({
        senderId: payload.senderId,
        senderName: payload.senderName || 'A player',
        senderAvatar: payload.senderAvatar,
        timestamp: payload.timestamp || new Date().toISOString(),
        roomId: payload.roomId
      });
      setShowInviteModal(true);
      setInviteStatus('pending');
      setCountdown(30);

      // Play sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    };

    const cleanup = wsService.on("game_invite_received", handleGameInvite);
    
    return () => cleanup();
  }, [showInviteModal]);

  // Listen for game_matched to auto-redirect on accept
  useEffect(() => {
    const handleGameMatched = (payload: any) => {
      console.log("[GameInviteProvider] Game matched:", payload);
      
      if (inviteStatus === 'accepting' && payload.gameId) {
        localStorage.setItem("pendingGameId", payload.gameId);
        localStorage.setItem("pendingGameInvite", JSON.stringify({
          opponentId: currentInvite?.senderId,
          opponentName: currentInvite?.senderName,
          opponentAvatar: currentInvite?.senderAvatar,
          side: payload.side,
          isBotGame: false
        }));
        
        setShowInviteModal(false);
        setCurrentInvite(null);
        setInviteStatus('idle');
        
        redirect('/game');
      }
    };

    const cleanup = wsService.on("game_matched", handleGameMatched);
    return () => cleanup();
  }, [inviteStatus, currentInvite]);

  // Countdown timer
  useEffect(() => {
    if (!showInviteModal || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          declineInvite(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showInviteModal, countdown]);

  // Accept invite
  const acceptInvite = async () => {
    if (!currentInvite || inviteStatus !== 'pending') return;
    
    setInviteStatus('accepting');
    console.log("[GameInviteProvider] Accepting invite from:", currentInvite.senderId);

    try {
      chatService.sendWebSocketMessage("accept_game", { 
        senderId: currentInvite.senderId 
      });
      // Don't close modal yet - wait for game_matched event
    } catch (error) {
      console.error("[GameInviteProvider] Failed to accept:", error);
      setInviteStatus('pending');
    }
  };

  // Decline invite
  const declineInvite = (isTimeout = false) => {
    if (!currentInvite || inviteStatus === 'accepting') return;
    
    setInviteStatus('declining');
    console.log("[GameInviteProvider] Declining invite:", isTimeout ? "(timeout)" : "");

    try {
      chatService.sendWebSocketMessage("reject_game", { 
        senderId: currentInvite.senderId 
      });
    } catch (error) {
      console.error("[GameInviteProvider] Failed to decline:", error);
    }

    setShowInviteModal(false);
    setCurrentInvite(null);
    setInviteStatus('idle');
  };

  return (
    <div>
      {children}
      
      {/* Global Invite Modal */}
      {showInviteModal && currentInvite && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => declineInvite(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-gradient-to-b from-dark-900 to-dark-950 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-accent-green/30">
            {/* Countdown */}
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-dark-950 border-2 border-accent-green flex items-center justify-center">
              <span className={`font-bold text-lg ${countdown <= 10 ? 'text-red-400 animate-pulse' : 'text-accent-green'}`}>
                {countdown}
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎮</div>
              <h2 className="text-2xl font-bold text-white">Game Invitation!</h2>
            </div>

            {/* Inviter info */}
            <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-dark-800/50 rounded-xl">
              <img 
                src={getAvatarUrl(currentInvite.senderAvatar)} 
                alt={currentInvite.senderName}
                className="w-16 h-16 rounded-full border-2 border-accent-green object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAvatarUrl(null);
                }}
              />
              <div className="text-left">
                <p className="text-white font-bold text-lg">{currentInvite.senderName}</p>
                <p className="text-gray-400 text-sm">wants to play Pong with you!</p>
              </div>
            </div>

            {/* Status */}
            {inviteStatus === 'accepting' && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 text-accent-green">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Creating game room...</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => declineInvite(false)}
                disabled={inviteStatus !== 'pending'}
                className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all
                  bg-red-500/20 text-red-400 border border-red-500/50
                  hover:bg-red-500/30 hover:border-red-400
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Decline
              </button>
              
              <button
                onClick={acceptInvite}
                disabled={inviteStatus !== 'pending'}
                className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all
                  bg-accent-green text-dark-950
                  hover:bg-accent-green/90 hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg shadow-accent-green/30"
              >
                {inviteStatus === 'accepting' ? 'Joining...' : 'Accept & Play!'}
              </button>
            </div>

            {/* Timer warning */}
            {countdown <= 10 && inviteStatus === 'pending' && (
              <p className="text-center text-red-400 text-sm mt-4 animate-pulse">
                ⚠️ Invitation expires in {countdown} seconds!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInviteProvider;
