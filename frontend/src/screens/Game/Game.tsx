// import { Bell as BellIcon, Search as SearchIcon } from "lucide-react";
import Fuego, { useState, useEffect, useRef } from "../../index";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "../../components/ui/avatar";
// import { Badge } from "../../components/ui/badge";
// import { Button } from "../../components/ui/button";
import Avatar from "../../assets/Ellipse 46.svg";

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
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
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

  return (
    <div className="bg-[#141517] overflow-hidden w-full min-w-[1431px] min-h-[1024px] relative">
      <div className="absolute top-[829px] left-[-165px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px]" />

      <footer className="absolute top-[930px] left-[62px] w-[1337px] h-[45px] flex justify-between items-start">
        <p className="w-[131px] h-[45px] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-[10px] tracking-[0] leading-[15px]">
          © 2025 — Built with passion by Ibnoukhalkane
        </p>

        {/* <nav className="mt-[11px] flex gap-[35px]">
          {footerLinks.map((link, index) => (
            <Button
              key={index}
              variant="link"
              className={`${link.width} h-[15px] [font-family:'Questrial',Helvetica] font-normal text-white text-base tracking-[0] leading-[15px] p-0 h-auto`}>
              {link.label}
            </Button>
          ))}
        </nav> */}
      </footer>

      <img
        className="absolute top-9 left-[52px] w-[50px] h-[50px]"
        alt="Group"
        src="/group-1.png"
      />

      {/* <nav className="absolute top-[53px] left-[148px] flex gap-[39px]">
        {navigationItems.map((item, index) => (
          <Button
            key={index}
            variant="link"
            className={`h-[15px] [font-family:'Questrial',Helvetica] font-normal ${
              item.active ? "text-[#f9f9f9]" : "text-[#f9f9f980]"
            } text-base tracking-[0] leading-[15px] whitespace-nowrap p-0 h-auto`}>
            {item.label}
          </Button>
        ))}
      </nav> */}

      <img
        className="absolute top-[114px] left-[52px] w-[1341px] h-[3px]"
        alt="Line"
        src="/line-8.svg"
      />

      <aside className="absolute top-[383px] left-[62px] w-[35px] h-[300px]">
        <img className="w-full h-full" alt="Group" src="/group-310.png" />
      </aside>

      <div className="absolute top-[42px] left-[1053px] w-[230px] h-10 flex items-center rounded-[20px] border border-solid border-[#f9f9f933] px-[15px]">
        {/* <SearchIcon className="w-[10px] h-[10px] text-[#f9f9f980]" /> */}
        <span className="ml-[7px] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-[11px] tracking-[0] leading-[15px] whitespace-nowrap">
          SearchIcon
        </span>
      </div>

      <div className="absolute top-[42px] left-[1306px] flex gap-1.5">
        {/* <Button
          variant="outline"
          className="w-10 h-10 relative rounded-[20px] border border-solid border-[#f9f9f980] bg-transparent p-0">
          <BellIcon className="w-[22px] h-[22px] text-white" />
          <Badge className="absolute top-[13px] left-[22px] w-[5px] h-[5px] bg-[#b7f272] rounded-[2.5px] p-0" />
        </Button> */}

        {/* <Avatar className="w-10 h-10">
          <AvatarImage src="/ellipse-5-1.png" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar> */}
      </div>

      <div className="absolute top-[450px] left-[616px] w-[200px] h-[200px] rounded-[100px] border border-solid border-[#f9f9f9]" />

      <img
        className="absolute top-[392px] left-[715px] w-px h-[315px] object-cover"
        alt="Line"
        src="/line-11.svg"
      />

      <div
        className="absolute w-5 h-5 bg-[#f9f9f9] rounded-[10px] transition-all duration-0"
        style={{
          left: `${148 + ballX}px`,
          top: `${173 + 60 + 20 + ballY}px`,
        }}
      />

      <div
        className="absolute w-5 bg-[#f9f9f9] rounded-[17px] transition-all duration-0"
        style={{
          height: `${PADDLE_HEIGHT}px`,
          left: "148px",
          top: `${173 + 60 + 20 + leftPaddleY}px`,
        }}
      />

      <div
        className="absolute w-5 bg-[#f9f9f9] rounded-[17px] transition-all duration-0"
        style={{
          height: `${PADDLE_HEIGHT}px`,
          left: `${148 + GAME_WIDTH - PADDLE_WIDTH}px`,
          top: `${173 + 60 + 20 + rightPaddleY}px`,
        }}
      />

      <section className="absolute top-[173px] left-[148px] w-[1150px] h-[60px] flex items-center justify-between">
        <div className="flex gap-[15px] items-center">
          <div className="w-[60px] h-[60px]">
            <img alt="Ellipse" src={Avatar} />
          </div>
          <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-base tracking-[0] leading-[27px] whitespace-nowrap">
            Eva
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-[32px] tracking-[0] leading-[27px] whitespace-nowrap">
            {leftScore}
          </span>
          <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-[32px] tracking-[0] leading-[27px] whitespace-nowrap">
            -
          </span>
          <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-[32px] tracking-[0] leading-[27px] whitespace-nowrap">
            {rightScore}
          </span>
        </div>

        <div className="flex gap-[17px] items-center">
          <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-base tracking-[0] leading-[27px] whitespace-nowrap">
            Renata
          </span>
          <div className="w-[60px] h-[60px]">
            <img alt="Ellipse" src={Avatar} />
          </div>
        </div>
      </section>

      {gameStarted && !gameEnded && (
        <div className="absolute top-[140px] left-[670px]">
          <span className="[font-family:'Questrial',Helvetica] font-normal text-[#b7f272] text-2xl tracking-[0] leading-[27px]">
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {!gameStarted && !gameEnded && (
        <div className="absolute top-[450px] left-[148px] w-[1150px] flex justify-center">
          <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-xl tracking-[0] leading-[27px]">
            Press SPACE to start • W/S and ↑/↓ to move
          </span>
        </div>
      )}

      {showPauseMenu && !gameEnded && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#1f2023] border border-[#f9f9f933] rounded-[20px] p-10 flex flex-col items-center gap-6 shadow-2xl animate-fade-up">
            <h2 className="[font-family:'Questrial',Helvetica] font-normal text-white text-3xl tracking-[0] leading-[27px]">
              Game Paused
            </h2>
            <div className="flex flex-col gap-4 w-[300px]">
              <button
                onClick={resumeGame}
                className="w-full h-12 bg-[#b7f272] hover:bg-[#a3dd5f] text-[#141517] rounded-[10px] [font-family:'Questrial',Helvetica] font-normal text-lg">
                Resume Game
              </button>
              <button
                onClick={resetGame}
                className="w-full h-12 bg-transparent hover:bg-[#f9f9f910] text-white border border-[#f9f9f980] rounded-[10px] [font-family:'Questrial',Helvetica] font-normal text-lg">
                Reset Game
              </button>
            </div>
          </div>
        </div>
      )}

      {gameEnded && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#1f2023] border border-[#f9f9f933] rounded-[20px] p-10 flex flex-col items-center gap-6 shadow-2xl animate-fade-up">
            <div className="flex flex-col items-center gap-4">
              <h2 className="[font-family:'Questrial',Helvetica] font-normal text-[#b7f272] text-4xl tracking-[0] leading-[27px]">
                Game Finished!
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#b7f272] to-transparent animate-shimmer"></div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                {/* <Avatar className="w-[80px] h-[80px]">
                  <img alt="Stars filled" src={StarsFilled} />
                </Avatar> */}

                <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-xl">
                  Eva
                </span>
                <span className="[font-family:'Questrial',Helvetica] font-normal text-[#b7f272] text-3xl">
                  {leftScore}
                </span>
              </div>

              <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-3xl">
                -
              </span>

              <div className="flex flex-col items-center gap-2">
                {/* <Avatar className="w-[80px] h-[80px]">
                  <AvatarImage src="/3.png" alt="Renata" />
                  <AvatarFallback>R</AvatarFallback>
                </Avatar> */}
                <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-xl">
                  Renata
                </span>
                <span className="[font-family:'Questrial',Helvetica] font-normal text-[#b7f272] text-3xl">
                  {rightScore}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="[font-family:'Questrial',Helvetica] font-normal text-white text-2xl">
                {leftScore > rightScore
                  ? "Eva Wins!"
                  : rightScore > leftScore
                  ? "Renata Wins!"
                  : "It's a Tie!"}
              </span>
            </div>

            {/* <Button
              onClick={resetGame}
              className="w-[300px] h-12 bg-[#b7f272] hover:bg-[#a3dd5f] text-[#141517] rounded-[10px] [font-family:'Questrial',Helvetica] font-normal text-lg mt-4">
              Play Again
            </Button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
