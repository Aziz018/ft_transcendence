/**
 * Game Lobby Component
 * Waiting room for game inviter - shows "Waiting for opponent..."
 */

import React, { useState, useEffect } from "react";
import { Link, redirect } from "../../router";
import { gameService } from "../../services/gameService";
import { getToken, decodeTokenPayload } from "../../lib/auth";
import Logo from "../../assets/secondLogo.svg";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import type { GameStartPayload } from "../../types/game";

const GameLobby = () => {
  const [status, setStatus] = useState<'waiting' | 'starting' | 'timeout'>('waiting');
  const [opponentName, setOpponentName] = useState<string>("");
  const [countdown, setCountdown] = useState(60); // 60 second timeout

  useEffect(() => {
    // Get pending invite info
    const pendingInviteStr = localStorage.getItem("pendingGameInvite");
    if (pendingInviteStr) {
      try {
        const invite = JSON.parse(pendingInviteStr);
        setOpponentName(invite.opponentName || "Opponent");
      } catch (e) {
        console.error("Failed to parse pending invite:", e);
      }
    }

    // Listen for game start
    const unsubscribeStart = gameService.onGameStart((data: GameStartPayload) => {
      console.log("[GameLobby] Game starting!", data);
      setStatus('starting');
      
      // Clear pending invite
      localStorage.removeItem("pendingGameInvite");
      
      // Redirect to game
      setTimeout(() => {
        window.location.href = "/game/play";
      }, 1000);
    });

    // Listen for timeout
    const unsubscribeTimeout = gameService.onTimeout((inviteId) => {
      console.log("[GameLobby] Invitation timeout, starting with bot");
      setStatus('timeout');
      
      // After 2 seconds, redirect to game with bot
      setTimeout(() => {
        localStorage.setItem("gameWithBot", "true");
        window.location.href = "/game/play";
      }, 2000);
    });

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      unsubscribeStart();
      unsubscribeTimeout();
      clearInterval(timer);
    };
  }, []);

  const handleCancel = () => {
    localStorage.removeItem("pendingGameInvite");
    window.location.href = "/dashboard";
  };

  return (
    <div className="bg-theme-bg-primary min-h-screen relative flex flex-col items-center justify-center p-4">
      <TopRightBlurEffect />
      
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <img src={Logo} alt="Logo" className="h-12" />
      </div>

      {/* Main Content */}
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 backdrop-blur-sm">
          {/* Status Icon */}
          <div className="flex justify-center mb-8">
            {status === 'waiting' && (
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-accent-green/20 flex items-center justify-center animate-pulse">
                  <span className="text-6xl">🎮</span>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-accent-orange rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white font-[Questrial] font-bold text-sm">
                    {countdown}s
                  </span>
                </div>
              </div>
            )}
            {status === 'starting' && (
              <div className="w-32 h-32 rounded-full bg-accent-green/20 flex items-center justify-center">
                <span className="text-6xl animate-bounce">✓</span>
              </div>
            )}
            {status === 'timeout' && (
              <div className="w-32 h-32 rounded-full bg-accent-orange/20 flex items-center justify-center">
                <span className="text-6xl">🤖</span>
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center mb-8">
            {status === 'waiting' && (
              <>
                <h1 className="text-4xl font-[Questrial] font-bold text-white mb-4">
                  Waiting for {opponentName}...
                </h1>
                <p className="text-white/70 text-lg font-[Questrial]">
                  Your game invitation has been sent.
                </p>
                <p className="text-white/50 text-sm font-[Questrial] mt-2">
                  If no response in {countdown} seconds, you'll play against a bot.
                </p>
              </>
            )}
            {status === 'starting' && (
              <>
                <h1 className="text-4xl font-[Questrial] font-bold text-accent-green mb-4">
                  Get Ready!
                </h1>
                <p className="text-white/70 text-lg font-[Questrial]">
                  {opponentName} accepted! Starting game...
                </p>
              </>
            )}
            {status === 'timeout' && (
              <>
                <h1 className="text-4xl font-[Questrial] font-bold text-accent-orange mb-4">
                  No Response
                </h1>
                <p className="text-white/70 text-lg font-[Questrial]">
                  Starting game with bot opponent...
                </p>
              </>
            )}
          </div>

          {/* Loading Animation */}
          {status === 'waiting' && (
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-3 h-3 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}

          {/* Actions */}
          {status === 'waiting' && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancel}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-[Questrial] font-semibold transition-all border border-white/20">
                Cancel & Return
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm font-[Questrial]">
            💡 Tip: Use <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">↑</kbd> and <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">↓</kbd> arrow keys to control your paddle
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
