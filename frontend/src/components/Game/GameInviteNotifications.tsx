/**
 * Game Invite Notifications Component
 * Shows pending game invitations in navbar with Accept/Reject actions
 */

import React, { useState, useEffect, useCallback } from "react";
import { gameService } from "../../services/gameService";
import { getAvatarUrl, DEFAULT_AVATAR } from "../../lib/avatar";
import type { GameInvitePayload } from "../../types/game";

interface GameInviteNotificationsProps {
  onCountChange?: (count: number) => void;
}

const GameInviteNotifications: React.FC<GameInviteNotificationsProps> = ({
  onCountChange,
}) => {
  const [invites, setInvites] = useState<GameInvitePayload[]>([]);
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  // Listen for game invitations
  useEffect(() => {
    console.log("[GameInviteNotifications] Component mounted, setting up listeners");
    
    const unsubscribe = gameService.onInvite((invite) => {
      console.log("[GameInviteNotifications] ✅ Received invite:", invite);
      setInvites((prev) => {
        // Check if invite already exists
        if (prev.some((i) => i.inviteId === invite.inviteId)) {
          console.log("[GameInviteNotifications] Invite already exists, skipping");
          return prev;
        }
        const updated = [...prev, invite];
        console.log("[GameInviteNotifications] Updated invites list, count:", updated.length);
        onCountChange?.(updated.length);
        return updated;
      });
    });

    // Listen for timeouts
    const unsubscribeTimeout = gameService.onTimeout((inviteId) => {
      console.log("[GameInviteNotifications] ⏱️ Invite timeout:", inviteId);
      setInvites((prev) => {
        const updated = prev.filter((i) => i.inviteId !== inviteId);
        onCountChange?.(updated.length);
        return updated;
      });
    });

    // Clean up expired invites on mount
    gameService.clearExpiredInvites();
    
    console.log("[GameInviteNotifications] ✅ Listeners registered");

    return () => {
      console.log("[GameInviteNotifications] Component unmounting, cleaning up listeners");
      unsubscribe();
      unsubscribeTimeout();
    };
  }, [onCountChange]);

  const handleAccept = useCallback((invite: GameInvitePayload) => {
    console.log("[GameInviteNotifications] 🎮 Accepting invite:", invite.inviteId);
    setProcessing((prev) => new Set(prev).add(invite.inviteId));
    
    // Accept the invitation
    gameService.acceptInvite(invite.inviteId);
    
    // Remove from list
    setInvites((prev) => {
      const updated = prev.filter((i) => i.inviteId !== invite.inviteId);
      onCountChange?.(updated.length);
      return updated;
    });
    
    // Redirect to game
    console.log("[GameInviteNotifications] Redirecting to game...");
    setTimeout(() => {
      window.location.href = "/game/play";
    }, 300);
  }, [onCountChange]);

  const handleReject = useCallback((invite: GameInvitePayload) => {
    console.log("[GameInviteNotifications] ❌ Rejecting invite:", invite.inviteId);
    setProcessing((prev) => new Set(prev).add(invite.inviteId));
    
    // Reject the invitation
    gameService.rejectInvite(invite.inviteId);
    
    // Remove from list
    setInvites((prev) => {
      const updated = prev.filter((i) => i.inviteId !== invite.inviteId);
      onCountChange?.(updated.length);
      return updated;
    });
  }, [onCountChange]);

  if (invites.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-white/50 text-sm font-[Questrial]">
          No game invitations
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {invites.map((invite) => {
        const isProcessing = processing.has(invite.inviteId);
        const timeLeft = Math.max(0, invite.expiresAt - Date.now());
        const secondsLeft = Math.ceil(timeLeft / 1000);

        return (
          <div
            key={invite.inviteId}
            className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
            <div className="flex items-start gap-3">
              <img
                src={getAvatarUrl(invite.inviterAvatar)}
                alt={invite.inviterName}
                className="w-12 h-12 rounded-full object-cover border-2 border-accent-green/50"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-white font-[Questrial] font-semibold text-sm">
                      🎮 Game Invitation
                    </p>
                    <p className="text-white/70 text-sm font-[Questrial]">
                      <span className="font-semibold">{invite.inviterName}</span>{" "}
                      wants to play Ping-Pong
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-accent-orange text-xs font-[Questrial] font-semibold">
                      {secondsLeft}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(invite)}
                    disabled={isProcessing}
                    className={`flex-1 px-4 py-2 rounded-lg font-[Questrial] font-semibold text-sm transition-all ${
                      isProcessing
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-accent-green hover:bg-accent-green/90 text-dark-950"
                    }`}>
                    {isProcessing ? "Processing..." : "✓ Accept"}
                  </button>
                  <button
                    onClick={() => handleReject(invite)}
                    disabled={isProcessing}
                    className={`flex-1 px-4 py-2 rounded-lg font-[Questrial] font-semibold text-sm transition-all ${
                      isProcessing
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}>
                    {isProcessing ? "Processing..." : "✗ Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameInviteNotifications;
