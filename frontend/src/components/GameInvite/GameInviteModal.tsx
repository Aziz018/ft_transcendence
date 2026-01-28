/**
 * GameInviteModal.tsx
 * 
 * A prominent modal that appears when a user receives a game invitation.
 * Shows the inviter's name/avatar and provides Accept/Decline buttons.
 * 
 * This component is designed to be always visible via a global context provider,
 * ensuring invitations are never missed.
 */

import Fuego, { useState, useEffect } from "../../index";
import { wsService } from "../../services/wsService";
import { chatService } from "../../services/chatService";
import { redirect } from "../../library/Router/Router";
import { getToken, decodeTokenPayload } from "../../lib/auth";

interface GameInvite {
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  roomId?: string;
}

interface GameInviteModalProps {
  // If you want to control visibility externally
  forceShow?: boolean;
}

export const GameInviteModal = ({ forceShow }: GameInviteModalProps) => {
  const [invite, setInvite] = useState<GameInvite | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [countdown, setCountdown] = useState(30); // 30 seconds to respond
  const [showModal, setShowModal] = useState(false);

  // Get avatar URL helper
  const getAvatarUrl = (path: string | null | undefined): string => {
    const backend = (import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api";
    if (!path || !path.trim()) return `${backend}/images/default-avatar.png`;
    if (path.startsWith("/public/")) return `${backend}${path.replace("/public", "")}`;
    if (path.startsWith("/")) return `${backend}${path}`;
    if (path.startsWith("http")) return path;
    return `${backend}/images/default-avatar.png`;
  };

  // Listen for game invites via WebSocket
  useEffect(() => {
    // Handler for game_invite_received
    const handleGameInvite = (payload: any) => {
      console.log("[GameInviteModal] Received game invite:", payload);
      
      // Don't show if user is already in a game
      if (window.location.pathname.startsWith('/game')) {
        console.log("[GameInviteModal] User already in game, ignoring invite");
        return;
      }

      setInvite({
        senderId: payload.senderId,
        senderName: payload.senderName || 'A player',
        senderAvatar: payload.senderAvatar,
        timestamp: payload.timestamp || new Date().toISOString(),
        roomId: payload.roomId
      });
      setShowModal(true);
      setCountdown(30);

      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    };

    // Subscribe to game invite events
    const cleanupInvite = wsService.on("game_invite_received", handleGameInvite);

    // Also listen for notification type that includes game invite
    const handleNotification = (payload: any) => {
      if (payload.gameInvite && payload.inviterId) {
        handleGameInvite({
          senderId: payload.inviterId,
          senderName: payload.message?.replace(' invited you to play!', '') || 'A player',
          timestamp: new Date().toISOString()
        });
      }
    };

    // We need to also capture notifications with gameInvite flag
    // The wsService already handles "notification" type, but we need the modal
    
    return () => {
      cleanupInvite();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!showModal || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Auto-decline when timer expires
          handleDecline(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal, countdown]);

  // Handle accept
  const handleAccept = async () => {
    if (!invite || isAccepting) return;
    
    setIsAccepting(true);
    console.log("[GameInviteModal] Accepting invite from:", invite.senderId);

    try {
      // Store invite info for the game page
      localStorage.setItem("pendingGameInvite", JSON.stringify({
        opponentId: invite.senderId,
        opponentName: invite.senderName,
        opponentAvatar: invite.senderAvatar || "",
        timestamp: Date.now()
      }));

      // Send accept message via WebSocket
      chatService.sendWebSocketMessage("accept_game", { 
        senderId: invite.senderId 
      });

      // Close modal
      setShowModal(false);
      setInvite(null);

      // Small delay to let backend create the game
      await new Promise(resolve => setTimeout(resolve, 300));

      // Navigate to game - the game page will handle joining via the game_matched event
      // Don't navigate immediately - wait for game_matched event
      // The redirect will happen via the wsService game_matched handler
      
    } catch (error) {
      console.error("[GameInviteModal] Failed to accept invite:", error);
      setIsAccepting(false);
    }
  };

  // Handle decline
  const handleDecline = (isTimeout = false) => {
    if (!invite || isDeclining) return;
    
    setIsDeclining(true);
    console.log("[GameInviteModal] Declining invite from:", invite.senderId, isTimeout ? "(timeout)" : "");

    try {
      // Send reject message via WebSocket
      chatService.sendWebSocketMessage("reject_game", { 
        senderId: invite.senderId 
      });
    } catch (error) {
      console.error("[GameInviteModal] Failed to decline invite:", error);
    }

    // Close modal regardless
    setShowModal(false);
    setInvite(null);
    setIsDeclining(false);
  };

  // Don't render if no modal to show
  if (!showModal || !invite) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => handleDecline(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-b from-dark-900 to-dark-950 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-accent-green/30 animate-pulse-slow">
        {/* Countdown ring */}
        <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-dark-950 border-2 border-accent-green flex items-center justify-center">
          <span className="text-accent-green font-bold text-lg">{countdown}</span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎮</div>
          <h2 className="text-2xl font-bold text-white">Game Invitation!</h2>
        </div>

        {/* Inviter info */}
        <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-dark-800/50 rounded-xl">
          <img 
            src={getAvatarUrl(invite.senderAvatar)} 
            alt={invite.senderName}
            className="w-16 h-16 rounded-full border-2 border-accent-green object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAvatarUrl(null);
            }}
          />
          <div className="text-left">
            <p className="text-white font-bold text-lg">{invite.senderName}</p>
            <p className="text-gray-400 text-sm">wants to play Pong with you!</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleDecline(false)}
            disabled={isDeclining || isAccepting}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all
              bg-red-500/20 text-red-400 border border-red-500/50
              hover:bg-red-500/30 hover:border-red-400
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeclining ? "Declining..." : "Decline"}
          </button>
          
          <button
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all
              bg-accent-green text-dark-950
              hover:bg-accent-green/90 hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-accent-green/30"
          >
            {isAccepting ? "Joining..." : "Accept & Play!"}
          </button>
        </div>

        {/* Timer warning */}
        {countdown <= 10 && (
          <p className="text-center text-red-400 text-sm mt-4 animate-pulse">
            ⚠️ Invitation expires in {countdown} seconds!
          </p>
        )}
      </div>
    </div>
  );
};

export default GameInviteModal;
