
import Fuego, { useState, useEffect, useRef } from "../../index";

import Avatar from "../../assets/Ellipse 46.svg";
import { getToken, decodeTokenPayload } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import { redirect } from "../../library/Router/Router";

const navigationItems = [
  { label: "Dashboard", active: false },
  { label: "Game", active: true },
  { label: "Chat", active: false },
  { label: "Tournament", active: false },
  { label: "Leaderboard", active: false },
];

const footerLinks = [
  { label: "Terms", width: "w-[50px]" },
  { label: "Help", width: "w-[38px]" },
  { label: "Privacy", width: "w-[61px]" },
];

const GAME_WIDTH = 1150;
const GAME_HEIGHT = 534;
const PADDLE_HEIGHT = 144;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 20;
const PADDLE_SPEED = 8;
const BALL_SPEED = 5;
const GAME_DURATION = 60;

function normalizeVel(vx: number, vy: number) {
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed === 0) return { vx: BALL_SPEED, vy: 0 };
  const scale = BALL_SPEED / speed;
  return { vx: vx * scale, vy: vy * scale };
}

export const Game = () => {
  const [isAuthenticated, setIsAuthenticated] = Fuego.useState(true);
  const [userAvatar, setUserAvatar] = Fuego.useState("");
  const [userName, setUserName] = Fuego.useState("You");
  const [opponent, setOpponent] = Fuego.useState<{
    name: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      redirect("/login");
    } else {
      const payload = decodeTokenPayload(token);
      if (payload && payload.mfa_required) {
        redirect("/secondary-login");
        return;
      }
      fetchUserProfile();
      loadGameInvitation();
    }
  }, []);

  const loadGameInvitation = () => {
    try {
      const inviteData = localStorage.getItem("pendingGameInvite");
      if (inviteData) {
        const invite = JSON.parse(inviteData);
        setOpponent({
          name: invite.opponentName || "Opponent",
          avatar: invite.opponentAvatar || "",
        });

        localStorage.removeItem("pendingGameInvite");
      }
    } catch (error) {
      console.error("Failed to load game invitation:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "/api";
      const token = getToken();

      const res = await fetch(`${backend}/v1/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserAvatar(data.avatar || "");
        setUserName(data.name || "You");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const getAvatarUrl = (path: string | null | undefined): string => {
    const backend =
      (import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api";
    if (!path || !path.trim()) return `${backend}/images/default-avatar.png`;
    if (path.startsWith("/public/"))
      return `${backend}${path.replace("/public", "")}`;
    if (path.startsWith("/")) return `${backend}${path}`;
    if (path.startsWith("http")) return path;
    return `${backend}/images/default-avatar.png`;
  };

  if (!isAuthenticated) {
    return null;
  }

  // Multiplayer State
  const [gameState, setGameState] = useState<any>(null);
  const [status, setStatus] = useState<"connecting" | "waiting" | "playing" | "paused" | "finished">("connecting");
  const [winner, setWinner] = useState<string | null>(null);
  const [isLeftPlayer, setIsLeftPlayer] = useState(false);

  // Restored State for UI compatibility
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [displayedXP, setDisplayedXP] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // Default or from server

  const [ballX, setBallX] = useState(GAME_WIDTH / 2);
  const [ballY, setBallY] = useState(GAME_HEIGHT / 2);
  const [leftPaddleY, setLeftPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddleY, setRightPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);

  const keysPressed = useRef<Set<string>>(new Set());

  // Derived state for backward compatibility
  const gameStarted = status === "playing";
  const gameEnded = status === "finished";

  // Connect and Join
  useEffect(() => {
    if (!isAuthenticated) return;

    wsService.connect().then(() => {
      console.log("Connected to WS, joining game queue...");
      setStatus("waiting");
      wsService.joinGame({ mode: "standard" });
    });

    // Listeners
    const cleanupStart = wsService.on("game_start", (data) => {
      console.log("Game Started:", data);
      setStatus("playing");
      setOpponent({
        name: data.opponentName || "Opponent",
        avatar: data.opponentAvatar || "",
      });
      setIsLeftPlayer(data.side === "left");
    });

    const cleanupState = wsService.on("game_state", (state) => {
      setGameState(state);
      setLeftScore(state.leftScore);
      setRightScore(state.rightScore);
      setBallX(state.ballX);
      setBallY(state.ballY);
      setLeftPaddleY(state.leftPaddleY);
      setLeftPaddleY(state.leftPaddleY);
      setRightPaddleY(state.rightPaddleY);
      if (typeof state.timeLeft === 'number') setTimeLeft(state.timeLeft);
      if (state.status) setStatus(state.status);
    });

    const cleanupOver = wsService.on("game_over", (data) => {
      console.log("Game Over:", data);
      setStatus("finished");
      setWinner(data.winnerId);
      if (data.xpEarned) {
        setDisplayedXP(data.xpEarned);
      }
    });

    return () => {
      cleanupStart();
      cleanupState();
      cleanupOver();
      wsService.leaveGame();
    };
  }, [isAuthenticated]);

  // Input Handling
  useEffect(() => {
    if (status !== "playing") return;

    const interval = setInterval(() => {
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
        wsService.movePaddle(-1); // Up
      } else if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) {
        wsService.movePaddle(1); // Down
      } else {
        wsService.movePaddle(0); // Stop
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key) keysPressed.current.add(e.key.toLowerCase());
      if (e.code === "Space") {
        wsService.sendGameAction("pause_game");
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key) keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatXP = (xp: number) => {
    return xp.toLocaleString();
  };


  // UI Handlers (Multiplayer doesn't really pause locally like offline)
  const resumeGame = () => {
    // No-op for multiplayer
  };

  const resetGame = () => {
    window.location.reload(); // Simplest way to re-queue
  };

  const showPauseMenu = false; // Disable pause menu for multiplayer
  const isPaused = false;

  return (
    <div className="bg-dark-950 w-full h-screen overflow-hidden relative flex items-center justify-center">
      <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px] pointer-events-none" />
      <img
        className="absolute top-[-338px] left-[1235px] max-w-full w-[900px] pointer-events-none"
        alt="Ellipse"
        src="/ellipse-2.svg"
      />
      <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px] pointer-events-none" />
      <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <section className="flex items-center justify-between w-[1150px] mb-4">
          <div className="flex gap-[15px] items-center">
            <div className="w-[60px] h-[60px] rounded-full border-2 border-accent-green/50 overflow-hidden">
              <img
                alt={userName}
                src={getAvatarUrl(userAvatar)}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  const backend =
                    (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
                    "/api";
                  e.currentTarget.src = `${backend}/images/default-avatar.png`;
                }}
              />
            </div>
            <span className="font-questrial font-normal text-light text-xl tracking-[0] leading-[27px] whitespace-nowrap">
              {userName}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            {gameStarted && !gameEnded && (
              <span className="font-questrial font-normal text-accent-green text-2xl tracking-[0] leading-[27px]">
                {formatTime(timeLeft)}
              </span>
            )}
            <div className="flex items-center gap-3.5">
              <span className="font-questrial font-normal text-light text-[42px] tracking-[0] leading-[27px] whitespace-nowrap">
                {leftScore}
              </span>
              <span className="font-questrial font-normal text-light/40 text-[32px] tracking-[0] leading-[27px] whitespace-nowrap">
                -
              </span>
              <span className="font-questrial font-normal text-light text-[42px] tracking-[0] leading-[27px] whitespace-nowrap">
                {rightScore}
              </span>
            </div>
          </div>

          <div className="flex gap-[17px] items-center">
            <span className="font-questrial font-normal text-light text-xl tracking-[0] leading-[27px] whitespace-nowrap">
              {opponent ? opponent.name : "Opponent"}
            </span>
            <div className="w-[60px] h-[60px] rounded-full border-2 border-accent-green/50 overflow-hidden">
              <img
                alt={opponent ? opponent.name : "Opponent"}
                src={getAvatarUrl(opponent ? opponent.avatar : "")}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  const backend =
                    (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
                    "/api";
                  e.currentTarget.src = `${backend}/images/default-avatar.png`;
                }}
              />
            </div>
          </div>
        </section>

        <div className="relative w-[1150px] h-[534px] bg-dark-900/50 backdrop-blur-sm rounded-2xl border-2 border-accent-green/30 shadow-[0_0_40px_rgba(183,242,114,0.15)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent-green/5 to-transparent pointer-events-none" />

          <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-light/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="absolute w-px h-full left-1/2 -translate-x-1/2 bg-gradient-to-b from-transparent via-light/20 to-transparent" />

          <div
            className="absolute w-5 h-5 bg-accent-green rounded-full shadow-[0_0_20px_rgba(183,242,114,0.6)] transition-all duration-0"
            style={{
              left: `${ballX}px`,
              top: `${ballY}px`,
            }}
          />

          <div
            className="absolute w-5 bg-gradient-to-r from-accent-green to-accent-green/80 rounded-[17px] shadow-[0_0_15px_rgba(183,242,114,0.4)] transition-all duration-0"
            style={{
              height: `${PADDLE_HEIGHT}px`,
              left: "0px",
              top: `${leftPaddleY}px`,
            }}
          />

          <div
            className="absolute w-5 bg-gradient-to-r from-accent-green/80 to-accent-green rounded-[17px] shadow-[0_0_15px_rgba(183,242,114,0.4)] transition-all duration-0"
            style={{
              height: `${PADDLE_HEIGHT}px`,
              left: `${GAME_WIDTH - PADDLE_WIDTH}px`,
              top: `${rightPaddleY}px`,
            }}
          />

          {!["playing", "finished"].includes(status) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-accent-green border-t-transparent rounded-full animate-spin" />
                <span className="font-questrial font-normal text-light text-2xl tracking-[0] leading-[27px] animate-pulse">
                  {status === "connecting"
                    ? "Connecting to Server..."
                    : "Waiting for Opponent..."}
                </span>
                <span className="font-questrial font-normal text-light/60 text-lg tracking-[0] leading-[27px]">
                  Game will start automatically
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => redirect("/dashboard")}
            className="font-questrial font-normal text-light/60 hover:text-accent-green text-sm tracking-[0] leading-[15px] transition-colors">
            Dashboard
          </button>
          <button
            onClick={() => redirect("/tournament")}
            className="font-questrial font-normal text-light/60 hover:text-accent-green text-sm tracking-[0] leading-[15px] transition-colors">
            Tournament
          </button>
          <button
            onClick={() => redirect("/leaderboard")}
            className="font-questrial font-normal text-light/60 hover:text-accent-green text-sm tracking-[0] leading-[15px] transition-colors">
            Leaderboard
          </button>
          <button
            onClick={() => redirect("/chat")}
            className="font-questrial font-normal text-light/60 hover:text-accent-green text-sm tracking-[0] leading-[15px] transition-colors">
            Chat
          </button>
        </div>
        <p className="font-questrial font-normal text-light/40 text-[10px] tracking-[0] leading-[15px] text-center">
          © 2025 — Built with passion by Ibnoukhalkane
        </p>
      </footer>

      {status === 'paused' && !gameEnded && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-900 border-2 border-accent-green/30 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(183,242,114,0.2)]">
            <h2 className="font-questrial font-normal text-light text-3xl tracking-[0] leading-[27px]">
              Game Paused
            </h2>
            <span className="font-questrial font-normal text-light/60 text-lg">
              {gameState?.pausedBy === gameState?.leftPlayer?.id || gameState?.pausedBy === gameState?.rightPlayer?.id ? "Player Paused" : "Paused"}
            </span>
            <div className="flex flex-col gap-4 w-[300px]">
              <button
                onClick={() => wsService.sendGameAction("pause_game")}
                className="w-full h-12 bg-accent-green hover:bg-accent-green/90 text-dark-950 rounded-lg font-questrial font-semibold text-lg transition-all shadow-[0_0_20px_rgba(183,242,114,0.3)] hover:shadow-[0_0_30px_rgba(183,242,114,0.5)]">
                Resume Game
              </button>
            </div>
          </div>
        </div>
      )}

      {gameEnded && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-900 border-2 border-accent-green/30 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(183,242,114,0.2)]">
            <div className="flex flex-col items-center gap-4">
              <h2 className="font-questrial font-normal text-accent-green text-4xl tracking-[0] leading-[27px]">
                Game Finished!
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent"></div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-[80px] h-[80px] rounded-full border-2 border-accent-green/50 overflow-hidden">
                  <img
                    alt={userName}
                    src={getAvatarUrl(userAvatar)}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      const backend =
                        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
                        "/api";
                      e.currentTarget.src = `${backend}/images/default-avatar.png`;
                    }}
                  />
                </div>
                <span className="font-questrial font-normal text-light text-xl">
                  {userName}
                </span>
                <span className="font-questrial font-normal text-accent-green text-3xl">
                  {leftScore}
                </span>
              </div>

              <span className="font-questrial font-normal text-light/40 text-3xl">
                -
              </span>

              <div className="flex flex-col items-center gap-2">
                <div className="w-[80px] h-[80px] rounded-full border-2 border-accent-green/50 overflow-hidden">
                  <img
                    alt={opponent ? opponent.name : "Opponent"}
                    src={getAvatarUrl(opponent ? opponent.avatar : "")}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      const backend =
                        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
                        "/api";
                      e.currentTarget.src = `${backend}/images/default-avatar.png`;
                    }}
                  />
                </div>
                <span className="font-questrial font-normal text-light text-xl">
                  {opponent ? opponent.name : "Opponent"}
                </span>
                <span className="font-questrial font-normal text-accent-green text-3xl">
                  {rightScore}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="font-questrial font-normal text-light text-2xl">
                {leftScore > rightScore
                  ? `🏆 ${userName} Wins!`
                  : rightScore > leftScore
                    ? `🏆 ${opponent ? opponent.name : "Opponent"} Wins!`
                    : "🤝 It's a Tie!"}
              </span>
            </div>

            {leftScore > rightScore && (
              <div className="flex flex-col items-center gap-2 mt-4 px-8 py-4 bg-accent-green/10 rounded-lg border border-accent-green/30 animate-fadeIn">
                <span className="font-questrial font-normal text-light/70 text-sm">
                  You've earned – keep going!
                </span>
                <span className="font-questrial font-bold text-accent-green text-3xl transition-all duration-100">
                  {formatXP(displayedXP)}xp
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3 w-[300px] mt-4">
              <button
                onClick={resetGame}
                className="w-full h-12 bg-accent-green hover:bg-accent-green/90 text-dark-950 rounded-lg font-questrial font-semibold text-lg transition-all shadow-[0_0_20px_rgba(183,242,114,0.3)] hover:shadow-[0_0_30px_rgba(183,242,114,0.5)] hover:scale-105">
                Play Again
              </button>
              <button
                onClick={() => redirect("/dashboard")}
                className="w-full h-12 bg-transparent hover:bg-accent-green/20 text-accent-green border-2 border-accent-green/50 rounded-lg font-questrial font-semibold text-lg transition-all hover:shadow-[0_0_20px_rgba(183,242,114,0.2)] hover:scale-105 animate-fadeIn">
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

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
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Game;
