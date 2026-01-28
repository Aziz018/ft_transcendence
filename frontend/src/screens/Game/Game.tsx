
import Fuego, { useState, useEffect, useRef } from "../../index";
import { getToken, decodeTokenPayload } from "../../lib/auth";
import { gameWsService } from "../../services/gameWsService";
import { wsService } from "../../services/wsService";
import { redirect } from "../../library/Router/Router";
import { chatService } from "../../services/chatService";

const GAME_WIDTH = 1150;
const GAME_HEIGHT = 534;
const PADDLE_HEIGHT = 144;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 20;

export const Game = () => {
  const [isAuthenticated, setIsAuthenticated] = Fuego.useState(true);
  const [userAvatar, setUserAvatar] = Fuego.useState("");
  const [userName, setUserName] = Fuego.useState("You");
  const [opponent, setOpponent] = useState<{
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
    }
  }, []);

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

  // === MULTIPLAYER STATE ===
  const [gameState, setGameState] = useState<any>(null);
  const [status, setStatus] = useState<"connecting" | "waiting" | "playing" | "paused" | "finished">("connecting");
  const [winner, setWinner] = useState<string | null>(null);
  const [isLeftPlayer, setIsLeftPlayer] = useState(false);

  // Game state for rendering
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [displayedXP, setDisplayedXP] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [ballX, setBallX] = useState(GAME_WIDTH / 2);
  const [ballY, setBallY] = useState(GAME_HEIGHT / 2);
  const [leftPaddleY, setLeftPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddleY, setRightPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);

  const keysPressed = useRef<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gameStarted = status === "playing";
  const gameEnded = status === "finished";

  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  // === LOAD OPPONENT FROM GAME INVITE ===
  useEffect(() => {
    const storedInvite = localStorage.getItem("pendingGameInvite");
    if (storedInvite && storedInvite !== "true") {
      try {
        const inviteData = JSON.parse(storedInvite);
        console.log("[Game] Loading opponent from localStorage:", inviteData);
        if (inviteData.opponentName && inviteData.opponentName !== "Opponent") {
          setOpponent({
            name: inviteData.opponentName,
            avatar: inviteData.opponentAvatar || "",
          });
        }
        if (inviteData.side) {
          setIsLeftPlayer(inviteData.side === 'left');
        }
      } catch (e) {
        console.warn("[Game] Failed to parse pendingGameInvite:", e);
      }
    }
  }, []);

  // === LISTEN FOR GAME_MATCHED FROM CHAT WS ===
  useEffect(() => {
    const cleanupChatMatch = wsService.on("game_matched", (data) => {
      console.log("[Chat WS] Game Matched:", data);
      
      const matchData = data.payload || data;
      
      if (matchData.gameId) {
        console.log("[Chat WS] Joining game:", matchData.gameId);
        localStorage.setItem("pendingGameId", matchData.gameId);
        localStorage.removeItem("pendingGameInvite");
        gameWsService.joinGame({ gameId: matchData.gameId });
      }
      
      const opponentName = matchData.opponentName || "Opponent";
      const isBotGame = matchData.isBotGame || matchData.opponentId?.startsWith('bot-');
      const botAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23000000"/%3E%3C/svg%3E';
      
      setOpponent({
        name: isBotGame ? "🤖 Bot" : opponentName,
        avatar: isBotGame ? botAvatar : (matchData.opponentAvatar || ""),
      });
      
      setIsLeftPlayer(matchData.side === 'left');
    });

    return () => {
      cleanupChatMatch();
    };
  }, []);

  // === GAME WEBSOCKET CONNECTION & LISTENERS ===
  useEffect(() => {
    if (!isAuthenticated) return;

    // Extract roomId from URL if present (/game/:roomId)
    const pathParts = window.location.pathname.split('/');
    const urlRoomId = pathParts.length >= 3 && pathParts[1] === 'game' ? pathParts[2] : null;

    gameWsService.connect().then(() => {
      console.log("[Game] Connected to Game WS");
      
      // Priority: URL roomId > localStorage pendingGameId > matchmaking
      const pendingGameId = urlRoomId || localStorage.getItem("pendingGameId");
      
      if (pendingGameId) {
        console.log("[Game] Joining private game:", pendingGameId);
        gameWsService.joinGame({ gameId: pendingGameId });
        localStorage.removeItem("pendingGameId");
      } else {
        const pendingInvite = localStorage.getItem("pendingGameInvite");
        if (pendingInvite) {
          console.log("[Game] Waiting for private game...");
          setStatus("waiting");
        } else {
          console.log("[Game] Joining matchmaking queue");
          gameWsService.joinGame({ mode: "standard" });
        }
      }
      setStatus("waiting");
    });

    // Game Start Event
    const cleanupStart = gameWsService.on("game_start", (data) => {
      console.log("[Game] Game Started:", data);
      setStatus("playing");

      const startData = data.payload || data;

      let opName = "Opponent";
      let opAvatar = "";

      if (startData.players && startData.playerNames) {
        const token = getToken();
        if (token) {
          const payload = decodeTokenPayload(token);
          const myId = payload?.id || payload?.uid;
          const otherId = startData.players.find((id: string) => id !== myId);
          if (otherId && startData.playerNames[otherId]) {
            opName = startData.playerNames[otherId];
            if (startData.playerAvatars && startData.playerAvatars[otherId]) {
              opAvatar = startData.playerAvatars[otherId];
            }
          }
        }
      }

      const finalOpName = startData.opponentName || opName;
      const finalOpAvatar = startData.opponentAvatar || opAvatar;

      if (finalOpName !== "Opponent" || finalOpAvatar !== "") {
        setOpponent({
          name: finalOpName,
          avatar: finalOpAvatar,
        });
      }

      const side = startData.side || 'left';
      setIsLeftPlayer(side === 'left');
    });

    // Game State Updates
    const cleanupState = gameWsService.on("game_state", (state) => {
      setGameState(state);
      setLeftScore(state.leftScore);
      setRightScore(state.rightScore);
      setBallX(state.ballX);
      setBallY(state.ballY);
      setLeftPaddleY(state.leftPaddleY);
      setRightPaddleY(state.rightPaddleY);
      if (typeof state.timeLeft === 'number') setTimeLeft(state.timeLeft);
      if (state.status) {
        if (state.status === 'active') setStatus('playing');
        else if (state.status === 'completed') setStatus('finished');
        else setStatus(state.status);
      }
    });

    // Game Over Event
    const cleanupOver = gameWsService.on("match_ended", (data) => {
      console.log("[Game] Game Over:", data);
      setStatus("finished");
      setWinner(data.winnerId);

      if (data.xpEarned) {
        setDisplayedXP(data.xpEarned);
      }
    });

    // Rejection Handler
    const cleanupRejection = chatService.onMessage((msg) => {
      if (msg.content && msg.content.includes("(Rejected)")) {
        setRejectionMessage("Game invitation was rejected.");
        setTimeout(() => {
          redirect('/chat');
        }, 2000);
      }
    });
    
    // Expired Invite Handlers
    const cleanupExpired = gameWsService.on("game_invite_expired", (data) => {
      console.log("[Game] Invite expired (Game WS)");
      localStorage.removeItem("pendingGameInvite");
      localStorage.removeItem("pendingGameId");
      alert(data.message || data.payload?.message || "Your game invite expired.");
      redirect('/chat');
    });
    
    const cleanupExpiredChat = wsService.on("game_invite_expired", (data) => {
      console.log("[Game] Invite expired (Chat WS)");
      localStorage.removeItem("pendingGameInvite");
      localStorage.removeItem("pendingGameId");
      const message = data.payload?.message || data.message || "Your game invite expired.";
      alert(message);
      redirect('/chat');
    });

    return () => {
      cleanupStart();
      cleanupState();
      cleanupOver();
      cleanupRejection();
      cleanupExpired();
      cleanupExpiredChat();
      gameWsService.leaveGame();
      setTimeout(() => {
        gameWsService.disconnect();
      }, 500);
    };
  }, [isAuthenticated]);

  // === INPUT HANDLING ===
  useEffect(() => {
    if (status !== "playing") return;

    const interval = setInterval(() => {
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
        gameWsService.movePaddle(-1);
      } else if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) {
        gameWsService.movePaddle(1);
      } else {
        gameWsService.movePaddle(0);
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key) keysPressed.current.add(e.key.toLowerCase());
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

  // === UTILITY FUNCTIONS ===
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatXP = (xp: number) => {
    return xp.toLocaleString();
  };

  const resetGame = () => {
    window.location.reload();
  };

  // === PERSPECTIVE LOGIC ===
  const displayBallX = isLeftPlayer ? ballX : GAME_WIDTH - ballX - BALL_SIZE;
  const displayMyPaddleY = isLeftPlayer ? leftPaddleY : rightPaddleY;
  const displayOpPaddleY = isLeftPlayer ? rightPaddleY : leftPaddleY;

  const myScore = isLeftPlayer ? leftScore : rightScore;
  const opponentScore = isLeftPlayer ? rightScore : leftScore;

  const iWon = myScore > opponentScore;
  const isTie = myScore === opponentScore;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-dark-950 relative overflow-hidden select-none">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-green/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Game Header / Scoreboard */}
        <section className="flex items-center justify-between w-[1150px] mb-4">
          <div className="flex gap-[15px] items-center">
            <div className="w-[60px] h-[60px] rounded-full border-2 border-accent-green/50 overflow-hidden shadow-[0_0_15px_rgba(183,242,114,0.2)]">
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
                {myScore}
              </span>
              <span className="font-questrial font-normal text-light/40 text-[32px] tracking-[0] leading-[27px] whitespace-nowrap">
                -
              </span>
              <span className="font-questrial font-normal text-light text-[42px] tracking-[0] leading-[27px] whitespace-nowrap">
                {opponentScore}
              </span>
            </div>
          </div>

          <div className="flex gap-[17px] items-center">
            <span className="font-questrial font-normal text-light text-xl tracking-[0] leading-[27px] whitespace-nowrap">
              {opponent ? opponent.name : "Opponent"}
            </span>
            <div className="w-[60px] h-[60px] rounded-full border-2 border-accent-green/50 overflow-hidden shadow-[0_0_15px_rgba(183,242,114,0.2)]">
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

        {/* Game Canvas Area */}
        <div className="relative w-[1150px] h-[534px] bg-dark-900/50 backdrop-blur-sm rounded-2xl border-2 border-accent-green/30 shadow-[0_0_40px_rgba(183,242,114,0.15)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent-green/5 to-transparent pointer-events-none" />

          {/* Center decoration */}
          <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-light/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-px h-full left-1/2 -translate-x-1/2 bg-gradient-to-b from-transparent via-light/20 to-transparent" />

          {/* Ball */}
          <div
            className="absolute w-5 h-5 bg-accent-green rounded-full shadow-[0_0_20px_rgba(183,242,114,0.6)] transition-all duration-0"
            style={{
              left: `${displayBallX}px`,
              top: `${ballY}px`,
            }}
          />

          {/* My Paddle */}
          <div
            className="absolute w-5 bg-gradient-to-r from-accent-green to-accent-green/80 rounded-[17px] shadow-[0_0_15px_rgba(183,242,114,0.4)] transition-all duration-0"
            style={{
              height: `${PADDLE_HEIGHT}px`,
              left: "0px",
              top: `${displayMyPaddleY}px`,
            }}
          />

          {/* Opponent Paddle */}
          <div
            className="absolute w-5 bg-gradient-to-r from-accent-green/80 to-accent-green rounded-[17px] shadow-[0_0_15px_rgba(183,242,114,0.4)] transition-all duration-0"
            style={{
              height: `${PADDLE_HEIGHT}px`,
              left: `${GAME_WIDTH - PADDLE_WIDTH}px`,
              top: `${displayOpPaddleY}px`,
            }}
          />

          {/* CONNECTING / WAITING OVERLAY */}
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

          {/* REJECTION OVERLAY */}
          {rejectionMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
              <div className="flex flex-col items-center gap-4 animate-fadeIn">
                <div className="text-6xl mb-2">🚫</div>
                <span className="font-questrial font-bold text-red-400 text-2xl tracking-[0] leading-[27px]">
                  {rejectionMessage}
                </span>
                <span className="font-questrial font-normal text-light/60 text-lg tracking-[0] leading-[27px]">
                  Returning to chat...
                </span>
              </div>
            </div>
          )}

          {/* PAUSED OVERLAY */}
          {status === 'paused' && !gameEnded && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-dark-900 border-2 border-accent-green/30 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(183,242,114,0.2)]">
                <h2 className="font-questrial font-normal text-light text-3xl tracking-[0] leading-[27px]">
                  Game Paused
                </h2>
                <span className="font-questrial font-normal text-light/60 text-lg">
                  {gameState?.pausedBy ? "Player Paused" : "Paused"}
                </span>
                <div className="flex flex-col gap-4 w-[300px]">
                  <button
                    onClick={() => gameWsService.sendGameAction("pause_game")}
                    className="w-full h-12 bg-accent-green hover:bg-accent-green/90 text-dark-950 rounded-lg font-questrial font-semibold text-lg transition-all shadow-[0_0_20px_rgba(183,242,114,0.3)] hover:shadow-[0_0_30px_rgba(183,242,114,0.5)]">
                    Resume Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
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

      {/* FINISHED OVERLAY */}
      {status === "finished" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-[500px] p-8 bg-dark-900 border border-accent-green/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">

            <h2 className="font-outfit font-bold text-4xl text-light mb-2 tracking-wide">
              Game Finished!
            </h2>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent mb-8" />

            {/* Score Display */}
            <div className="flex items-center justify-center gap-8 mb-6 w-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-[80px] h-[80px] rounded-full border-2 border-accent-green/50 overflow-hidden shadow-[0_0_15px_rgba(183,242,114,0.2)]">
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
                  {myScore}
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
                  {opponentScore}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="font-questrial font-normal text-light text-2xl">
                {iWon
                  ? `🏆 ${userName} Wins!`
                  : !isTie
                    ? `🏆 ${opponent ? opponent.name : "Opponent"} Wins!`
                    : "🤝 It's a Tie!"}
              </span>
            </div>

            {(displayedXP > 0 || iWon) && (
              <div className="flex flex-col items-center gap-2 mt-4 px-8 py-4 bg-accent-green/10 rounded-lg border border-accent-green/30 animate-fadeIn">
                <span className="font-questrial font-normal text-light/70 text-sm">
                  XP Earned
                </span>
                <span className="font-questrial font-bold text-accent-green text-3xl transition-all duration-100">
                  +{formatXP(displayedXP)}xp
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
