
import Fuego, { useState, useEffect, useRef } from "../../index";

import Avatar from "../../assets/Ellipse 46.svg";
import { getToken, decodeTokenPayload } from "../../lib/auth";
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

  const [leftPaddleY, setLeftPaddleY] = useState(
    GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2
  );
  const [rightPaddleY, setRightPaddleY] = useState(
    GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2
  );
  const [ballX, setBallX] = useState(GAME_WIDTH / 2);
  const [ballY, setBallY] = useState(GAME_HEIGHT / 2);
  const [ballVelocityX, setBallVelocityX] = useState(BALL_SPEED);
  const [ballVelocityY, setBallVelocityY] = useState(BALL_SPEED);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameEnded, setGameEnded] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [displayedXP, setDisplayedXP] = useState(0);

  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (!gameStarted && !gameEnded) {
          setGameStarted(true);
        } else if (gameStarted && !gameEnded) {
          setShowPauseMenu(true);
          setIsPaused(true);
        }
        return;
      }
      if (e.key) {
        keysPressed.current.add(e.key.toLowerCase());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key) {
        keysPressed.current.delete(e.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameStarted, gameEnded]);

  useEffect(() => {
    if (!gameStarted || gameEnded || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameEnded(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, isPaused]);

  useEffect(() => {
    if (!gameEnded || leftScore <= rightScore) {
      setDisplayedXP(0);
      return;
    }

    const targetXP = leftScore * 26;
    const duration = 2000; // 2 seconds animation
    const steps = 60; // 60 frames
    const increment = targetXP / steps;
    let currentStep = 0;

    setDisplayedXP(0);

    saveXPToBackend(targetXP);

    const counter = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayedXP(targetXP);
        clearInterval(counter);
      } else {
        setDisplayedXP(Math.floor(increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(counter);
  }, [gameEnded, leftScore, rightScore]);

  const saveXPToBackend = async (earnedXP: number) => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "/api";
      const token = getToken();

      if (!token) {
        console.error("[Game] No token found");
        return;
      }

      const response = await fetch(`${backend}/v1/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: "xp",
          value: earnedXP.toString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[Game] Failed to save XP. Status: ${response.status}, Error: ${errorText}`
        );
        return;
      }

      const result = await response.json();
      console.log(`[Game] Saved ${earnedXP} XP to backend. Response:`, result);
    } catch (error) {
      console.error("[Game] Failed to save XP:", error);
    }
  };

  useEffect(() => {
    if (!gameStarted || isPaused || gameEnded) return;

    const gameLoop = setInterval(() => {
      setLeftPaddleY((prev) => {
        let newY = prev;
        if (keysPressed.current.has("w")) newY -= PADDLE_SPEED;
        if (keysPressed.current.has("s")) newY += PADDLE_SPEED;
        return Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY));
      });

      setRightPaddleY((prev) => {
        let newY = prev;
        if (keysPressed.current.has("arrowup")) newY -= PADDLE_SPEED;
        if (keysPressed.current.has("arrowdown")) newY += PADDLE_SPEED;
        return Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY));
      });

      setBallX((prevX) => prevX + ballVelocityX);
      setBallY((prevY) => prevY + ballVelocityY);
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, ballVelocityX, ballVelocityY, isPaused, gameEnded]);

  useEffect(() => {
    if (!gameStarted || isPaused || gameEnded) return;

    if (ballY <= 0) {
      setBallY(0);
      const { vx, vy } = normalizeVel(ballVelocityX, Math.abs(ballVelocityY));
      setBallVelocityX(vx);
      setBallVelocityY(vy);
    } else if (ballY >= GAME_HEIGHT - BALL_SIZE) {
      setBallY(GAME_HEIGHT - BALL_SIZE);
      const { vx, vy } = normalizeVel(ballVelocityX, -Math.abs(ballVelocityY));
      setBallVelocityX(vx);
      setBallVelocityY(vy);
    }

    if (
      ballX <= PADDLE_WIDTH &&
      ballY + BALL_SIZE >= leftPaddleY &&
      ballY <= leftPaddleY + PADDLE_HEIGHT
    ) {
      const hitPos = (ballY - leftPaddleY) / PADDLE_HEIGHT - 0.5; // -0.5 .. 0.5
      const targetVx = Math.abs(ballVelocityX) || BALL_SPEED;
      const targetVy = hitPos * BALL_SPEED * 2;
      const { vx, vy } = normalizeVel(targetVx, targetVy);
      setBallVelocityX(vx);
      setBallVelocityY(vy);
    }

    if (
      ballX >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
      ballY + BALL_SIZE >= rightPaddleY &&
      ballY <= rightPaddleY + PADDLE_HEIGHT
    ) {
      const hitPos = (ballY - rightPaddleY) / PADDLE_HEIGHT - 0.5;
      const targetVx = -Math.abs(ballVelocityX) || -BALL_SPEED;
      const targetVy = hitPos * BALL_SPEED * 2;
      const { vx, vy } = normalizeVel(targetVx, targetVy);
      setBallVelocityX(vx);
      setBallVelocityY(vy);
    }

    if (ballX < 0) {
      setRightScore((s) => s + 1);
      resetBall();
    }

    if (ballX > GAME_WIDTH) {
      setLeftScore((s) => s + 1);
      resetBall();
    }
  }, [
    ballX,
    ballY,
    leftPaddleY,
    rightPaddleY,
    gameStarted,
    isPaused,
    gameEnded,
  ]);

  const resetBall = () => {
    setBallX(GAME_WIDTH / 2);
    setBallY(GAME_HEIGHT / 2);
    setBallVelocityX((prev) => (prev > 0 ? -BALL_SPEED : BALL_SPEED));
    setBallVelocityY(BALL_SPEED * (Math.random() > 0.5 ? 1 : -1));
  };

  const resetGame = () => {
    setLeftScore(0);
    setRightScore(0);
    setTimeLeft(GAME_DURATION);
    setGameEnded(false);
    setGameStarted(false);
    setShowPauseMenu(false);
    setIsPaused(false);
    setDisplayedXP(0);
    resetBall();
    setLeftPaddleY(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setRightPaddleY(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  };

  const resumeGame = () => {
    setShowPauseMenu(false);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateXP = () => {
    if (leftScore > rightScore) {
      return leftScore * 26;
    }
    return 0;
  };

  const formatXP = (xp: number) => {
    return xp.toLocaleString();
  };

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

          {!gameStarted && !gameEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <span className="font-questrial font-normal text-light text-2xl tracking-[0] leading-[27px] animate-pulse">
                  Press SPACE to start
                </span>
                <span className="font-questrial font-normal text-light/60 text-lg tracking-[0] leading-[27px]">
                  W/S and ↑/↓ to move
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

      {showPauseMenu && !gameEnded && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-900 border-2 border-accent-green/30 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(183,242,114,0.2)]">
            <h2 className="font-questrial font-normal text-light text-3xl tracking-[0] leading-[27px]">
              Game Paused
            </h2>
            <div className="flex flex-col gap-4 w-[300px]">
              <button
                onClick={resumeGame}
                className="w-full h-12 bg-accent-green hover:bg-accent-green/90 text-dark-950 rounded-lg font-questrial font-semibold text-lg transition-all shadow-[0_0_20px_rgba(183,242,114,0.3)] hover:shadow-[0_0_30px_rgba(183,242,114,0.5)]">
                Resume Game
              </button>
              <button
                onClick={resetGame}
                className="w-full h-12 bg-transparent hover:bg-white/10 text-light border-2 border-white/20 rounded-lg font-questrial font-normal text-lg transition-all">
                Reset Game
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
