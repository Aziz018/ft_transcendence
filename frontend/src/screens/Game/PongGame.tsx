/**
 * Ping-Pong Game Component
 * Real-time multiplayer Ping-Pong game with pause/exit functionality
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { gameService } from "../../services/gameService";
import { getToken, decodeTokenPayload } from "../../lib/auth";
import { fetchWithAuth } from "../../lib/fetch";
import { API_CONFIG } from "../../config/api";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import type { GameState, GameEndPayload, Player } from "../../types/game";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const PADDLE_SPEED = 8;

interface PongGameProps {
  onBackToMenu?: () => void;
  gameMode?: "local" | "remote" | "bot";
}

const PongGame = ({ onBackToMenu, gameMode = "remote" }: PongGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [gameResult, setGameResult] = useState<GameEndPayload | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [isMyPaddle, setIsMyPaddle] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false
  });

  const keysPressed = useRef<Set<string>>(new Set<string>());
  const animationFrameId = useRef<number | undefined>(undefined);
  const isGameEndedRef = useRef(false);

  // Initialize game
  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const payload = decodeTokenPayload(token);
    if (payload?.uid) {
      setMyPlayerId(payload.uid);
    }

    // Check game mode
    if (gameMode === "local") {
      initLocalGame(payload?.uid || "", payload?.name || "Player 1");
    } else if (gameMode === "bot" || localStorage.getItem("gameWithBot") === "true") {
      // Initialize bot game
      initBotGame(payload?.uid || "", payload?.name || "Player");
      localStorage.removeItem("gameWithBot");
    } else {
      // Remote Game - Join Queue
      gameService.joinQueue();
    }

    // Listen for game state updates
    const unsubscribeState = gameService.onGameState((data) => {
      // Backend uses vx/vy, Frontend uses velocityX/velocityY. Map it?
      // Actually backend 'state' payload already sends 'ball' object.
      // If backend sends vx/vy, we might need to map it here too if we rely on it for prediction?
      // But usually just setting state is enough.
      setGameState(data.state);
    });

    // Listen for game start
    const unsubscribeStart = gameService.onGameStart((data) => {
      console.log("[PongGame] Game started:", data);
      // data.ball has vx, vy from backend. Map to velocityX, velocityY.
      const token = getToken();
      const payload = decodeTokenPayload(token);
      const currentUid = payload?.uid || "";
      const backendBall = (data as any).ball;

      const initialState: GameState = {
        id: data.gameId,
        status: 'playing',
        player1: {
          id: data.player1.id,
          name: data.player1.name,
          score: 0,
          type: 'player',
          ready: true
        },
        player2: {
          id: data.player2.id,
          name: data.player2.name,
          score: 0,
          type: 'player',
          ready: true
        },
        ball: {
          x: backendBall.x,
          y: backendBall.y,
          velocityX: backendBall.vx,
          velocityY: backendBall.vy,
          speed: 5,
        },
        paddle1: {
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          height: PADDLE_HEIGHT,
          velocity: 0
        },
        paddle2: {
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          height: PADDLE_HEIGHT,
          velocity: 0
        },
        maxScore: 5
      };
      setGameState(initialState);

      // Determine my paddle side
      if (data.player1.id === currentUid) {
        setIsMyPaddle({ left: true, right: false });
      } else if (data.player2.id === currentUid) {
        setIsMyPaddle({ left: false, right: true });
      }
    });

    // Listen for game end
    const unsubscribeEnd = gameService.onGameEnd((data) => {
      console.log("[PongGame] Game ended:", data);
      setGameResult(data);
      setShowEndModal(true);

      // Update UI for XP (Backend already updated DB)
      if (data.winnerId === myPlayerId) {
        window.dispatchEvent(new CustomEvent("profile-updated", {
          detail: { xp: data.xpGained, xpGained: data.xpGained }
        }));
      }
      setGameState(prev => prev ? ({ ...prev, status: 'finished' }) : null);
    });

    const unsubscribePaused = gameService.onGamePaused((paused) => {
      if (gameMode === 'remote') {
        setShowPauseModal(paused);
      }
    });

    return () => {
      unsubscribeState();
      unsubscribeStart();
      unsubscribeEnd();
      unsubscribePaused();
      if (gameMode === "remote") {
        gameService.leaveQueue();
      }
      if (typeof animationFrameId.current === 'number') {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const initBotGame = (playerId: string, playerName: string) => {
    const initialState: GameState = {
      id: `game_${Date.now()}`,
      status: 'playing',
      player1: {
        id: playerId,
        name: playerName,
        score: 0,
        type: 'player',
        ready: true,
      },
      player2: {
        id: 'bot',
        name: 'Bot',
        score: 0,
        type: 'bot',
        ready: true,
      },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        velocityX: 5,
        velocityY: 5,
        speed: 5,
      },
      paddle1: {
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        velocity: 0,
      },
      paddle2: {
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        velocity: 0,
      },
      maxScore: 3,
      startTime: Date.now(),
    };

    setGameState(initialState);
    isGameEndedRef.current = false;
    setGameState(initialState);
    setIsMyPaddle({ left: true, right: false });
  };

  const initLocalGame = (playerId: string, playerName: string) => {
    const initialState: GameState = {
      id: `game_local_${Date.now()}`,
      status: 'playing',
      player1: {
        id: playerId,
        name: playerName, // Right Paddle
        score: 0,
        type: 'player',
        ready: true,
      },
      player2: {
        id: 'local_p2',
        name: 'Player 2', // Left Paddle
        score: 0,
        type: 'player',
        ready: true,
      },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        velocityX: 5,
        velocityY: 5,
        speed: 5,
      },
      paddle1: {
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        velocity: 0,
      },
      paddle2: {
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        velocity: 0,
      },
      maxScore: 5,
      startTime: Date.now(),
    };

    setGameState(initialState);
    isGameEndedRef.current = false;
    // In local mode, we control both paddles locally
    setIsMyPaddle({ left: true, right: true });
  };

  // Save local/bot game to backend
  const saveLocalGame = async (result: GameEndPayload) => {
    if (gameMode === 'remote') return;

    try {
      const isWin = result.winnerId === myPlayerId;
      const p1Score = isWin ? result.winnerScore : result.loserScore;
      const p2Score = isWin ? result.loserScore : result.winnerScore;

      const res = await fetchWithAuth(API_CONFIG.GAME.SAVE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: gameMode,
          player1Score: p1Score,
          player2Score: p2Score,
          winner: isWin ? 'p1' : 'p2'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Dispatch event to update UI with actual XP from backend
        window.dispatchEvent(new CustomEvent("profile-updated", {
          detail: { xp: data.xp } // Backend returns xp gained
        }));
      }
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState?.status === 'playing') {
          if (gameMode === 'remote') {
            gameService.pauseGame(gameState.id);
          } else {
            setShowPauseModal(true);
          }
        }
      }
      keysPressed.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState?.status]);

  // Game loop
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || showPauseModal) {
      return;
    }

    const updateGame = () => {
      if (!gameState) return;

      const newState = { ...gameState };

      // Move paddles based on keyboard input
      if (isMyPaddle.left) {
        // P1 (Left) uses W/S in Local Mode, Arrows in Online Mode
        const upKey = gameMode === 'local' ? "KeyW" : "ArrowUp";
        const downKey = gameMode === 'local' ? "KeyS" : "ArrowDown";

        if (keysPressed.current.has(upKey)) {
          newState.paddle1.y = Math.max(0, newState.paddle1.y - PADDLE_SPEED);
          if (gameMode !== 'local') gameService.movePaddle(newState.paddle1.y);
        }
        if (keysPressed.current.has(downKey)) {
          newState.paddle1.y = Math.min(
            CANVAS_HEIGHT - PADDLE_HEIGHT,
            newState.paddle1.y + PADDLE_SPEED
          );
          if (gameMode !== 'local') gameService.movePaddle(newState.paddle1.y);
        }
      }

      // Bot AI for player2 (if playing with bot)
      // Bot AI for player2 (if playing with bot)
      if (gameState.player2.type === 'bot') {
        const paddle2Center = newState.paddle2.y + PADDLE_HEIGHT / 2;
        const ballY = newState.ball.y;

        if (ballY < paddle2Center - 10) {
          newState.paddle2.y = Math.max(0, newState.paddle2.y - PADDLE_SPEED * 0.7);
        } else if (ballY > paddle2Center + 10) {
          newState.paddle2.y = Math.min(
            CANVAS_HEIGHT - PADDLE_HEIGHT,
            newState.paddle2.y + PADDLE_SPEED * 0.7
          );
        }
      } else if (isMyPaddle.right) {
        // Player 2 input (Right Paddle) - Always Arrows for P2 (Local or Remote)
        // If Local: P2 uses Arrows (P1 uses W/S)
        // If Remote: I am P2, I use Arrows (Standard controls)
        if (keysPressed.current.has("ArrowUp")) {
          newState.paddle2.y = Math.max(0, newState.paddle2.y - PADDLE_SPEED);
          if (gameMode === 'remote') gameService.movePaddle(newState.paddle2.y);
        }
        if (keysPressed.current.has("ArrowDown")) {
          newState.paddle2.y = Math.min(
            CANVAS_HEIGHT - PADDLE_HEIGHT,
            newState.paddle2.y + PADDLE_SPEED
          );
          if (gameMode === 'remote') gameService.movePaddle(newState.paddle2.y);
        }
      }

      // Server handles physics for remote games
      if (gameMode !== 'remote') {
        // Move ball
        newState.ball.x += newState.ball.velocityX;
        newState.ball.y += newState.ball.velocityY;

        // Ball collision with top/bottom walls
        if (newState.ball.y <= 0 || newState.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
          newState.ball.velocityY *= -1;
        }

        // Ball collision with paddles
        if (
          newState.ball.x <= PADDLE_WIDTH &&
          newState.ball.y + BALL_SIZE >= newState.paddle1.y &&
          newState.ball.y <= newState.paddle1.y + PADDLE_HEIGHT
        ) {
          newState.ball.velocityX *= -1.1;
          newState.ball.x = PADDLE_WIDTH;
        }

        if (
          newState.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
          newState.ball.y + BALL_SIZE >= newState.paddle2.y &&
          newState.ball.y <= newState.paddle2.y + PADDLE_HEIGHT
        ) {
          newState.ball.velocityX *= -1.1;
          newState.ball.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
        }

        // Scoring
        if (newState.ball.x <= 0) {
          newState.player2.score++;
          resetBall(newState);
        } else if (newState.ball.x >= CANVAS_WIDTH) {
          newState.player1.score++;
          resetBall(newState);
        }

        // Check for game end
        if (
          newState.player1.score >= newState.maxScore ||
          newState.player2.score >= newState.maxScore
        ) {
          newState.status = 'finished';
          setGameState(newState);
          endGame(newState);
          return;
        }
      }

      setGameState(newState);
    };

    const renderGame = () => {
      const canvas = canvasRef.current;
      if (!canvas || !gameState) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw center line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = "#b7f272";
      ctx.fillRect(0, gameState.paddle1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(
        CANVAS_WIDTH - PADDLE_WIDTH,
        gameState.paddle2.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      );

      // Draw ball
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
        gameState.ball.x + BALL_SIZE / 2,
        gameState.ball.y + BALL_SIZE / 2,
        BALL_SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw scores
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        gameState.player1.score.toString(),
        CANVAS_WIDTH / 4,
        80
      );
      ctx.fillText(
        gameState.player2.score.toString(),
        (CANVAS_WIDTH * 3) / 4,
        80
      );

      // Draw player names
      ctx.font = "16px Arial";
      ctx.fillText(gameState.player1.name, CANVAS_WIDTH / 4, 120);
      ctx.fillText(gameState.player2.name, (CANVAS_WIDTH * 3) / 4, 120);
    };

    const gameLoop = () => {
      updateGame();
      renderGame();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, showPauseModal, isMyPaddle]);

  const resetBall = (state: GameState) => {
    state.ball.x = CANVAS_WIDTH / 2;
    state.ball.y = CANVAS_HEIGHT / 2;
    state.ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * 5;
    state.ball.velocityY = (Math.random() - 0.5) * 10;
  };

  const endGame = (state: GameState) => {
    if (isGameEndedRef.current) return;
    isGameEndedRef.current = true;

    const winner = state.player1.score >= state.maxScore ? state.player1 : state.player2;
    const loser = winner.id === state.player1.id ? state.player2 : state.player1;
    const scoreDiff = Math.abs(winner.score - loser.score);
    const xpGained = (gameMode === 'local' || gameMode === 'bot') ? 0 : scoreDiff * 25;

    const result: GameEndPayload = {
      gameId: state.id,
      winnerId: winner.id,
      winnerScore: winner.score,
      loserId: loser.id,
      loserScore: loser.score,
      scoreDifference: scoreDiff,
      xpGained,
    };

    setGameResult(result);
    setShowEndModal(true);

    if (gameMode === 'local' || gameMode === 'bot') {
      saveLocalGame(result);
    }
  };

  const handleContinue = () => {
    if (gameMode === 'remote') {
      if (gameState) gameService.pauseGame(gameState.id);
    } else {
      setShowPauseModal(false);
    }
  };

  const handleExit = () => {
    if (gameState && gameMode !== 'local') {
      gameService.exitGame(gameState.id);
    }
    if (onBackToMenu) onBackToMenu();
    else window.location.href = "/dashboard";
  };

  const handlePlayAgain = () => {
    if (gameMode === "local" && gameState) {
      initLocalGame(gameState.player1.id, gameState.player1.name);
      setShowEndModal(false);
      setGameResult(null);
    } else {
      window.location.href = "/chat";
    }
  };

  const handleBackToDashboard = () => {
    if (onBackToMenu) onBackToMenu();
    else window.location.href = "/dashboard";
  };

  if (!gameState) {
    return (
      <div className="bg-theme-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl font-[Questrial]">
          {gameMode === 'remote' ? "Waiting for opponent..." : "Loading game..."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-bg-primary min-h-screen relative flex flex-col items-center justify-center p-4">
      <TopRightBlurEffect />

      {/* Game Info */}
      <div className="mb-4 text-center">
        <p className="text-white/50 text-sm font-[Questrial]">
          Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">SPACE</kbd> to pause
          {gameMode === "local" && (
            <span className="ml-4">
              P1: <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">↑</kbd> <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">↓</kbd>
              &nbsp;|&nbsp;
              P2: <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">W</kbd> <kbd className="px-2 py-1 bg-white/10 rounded text-white/70">S</kbd>
            </span>
          )}
        </p>
      </div>

      {/* Canvas */}
      <div className="border-4 border-white/10 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(183,242,114,0.2)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-3xl font-[Questrial] font-bold text-white text-center mb-6">
              Game Paused
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinue}
                className="w-full px-6 py-3 bg-accent-green hover:bg-accent-green/90 text-dark-950 rounded-lg font-[Questrial] font-semibold text-lg transition-all">
                Continue
              </button>
              <button
                onClick={handleExit}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-[Questrial] font-semibold text-lg transition-all">
                Exit (Forfeit)
              </button>
            </div>
            <p className="text-white/50 text-xs text-center mt-4 font-[Questrial]">
              ⚠️ Exiting will count as a loss
            </p>
          </div>
        </div>
      )}

      {/* End Game Modal */}
      {showEndModal && gameResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
            {gameResult.winnerId === myPlayerId ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-4xl font-[Questrial] font-bold text-accent-green mb-2">
                    Victory!
                  </h2>
                  <p className="text-white/70 font-[Questrial]">
                    Congratulations! You won the game.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/70 font-[Questrial]">Final Score</span>
                    <span className="text-2xl font-[Questrial] font-bold text-white">
                      {gameResult.winnerScore} - {gameResult.loserScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 font-[Questrial]">XP Earned</span>
                    <span className="text-2xl font-[Questrial] font-bold text-accent-green">
                      +{gameResult.xpGained} XP
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mt-2 font-[Questrial]">
                    ({gameResult.scoreDifference} × 25 = {gameResult.xpGained} XP)
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">😔</div>
                  <h2 className="text-4xl font-[Questrial] font-bold text-red-500 mb-2">
                    Defeat
                  </h2>
                  <p className="text-white/70 font-[Questrial]">
                    Better luck next time!
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 font-[Questrial]">Final Score</span>
                    <span className="text-2xl font-[Questrial] font-bold text-white">
                      {gameResult.loserScore} - {gameResult.winnerScore}
                    </span>
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePlayAgain}
                className="w-full px-6 py-3 bg-accent-green hover:bg-accent-green/90 text-dark-950 rounded-lg font-[Questrial] font-semibold transition-all">
                Play Again
              </button>
              <button
                onClick={handleBackToDashboard}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-[Questrial] font-semibold transition-all">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PongGame;
