import React, { useState } from "react";
import { redirect } from "../../router";
import PongGame from "./PongGame";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import Logo from "../../assets/secondLogo.svg";

type GameMode = "menu" | "local" | "remote" | "bot";

const Game = () => {
  const [gameMode, setGameMode] = useState<GameMode>("menu");

  const handlePlayLocal = () => {
    setGameMode("local");
  };

  const handlePlayRemote = () => {
    // Set flag for remote play
    localStorage.setItem("gameWithBot", "false");
    setGameMode("remote");
  };

  const handlePlayBot = () => {
    // Set flag for bot play
    localStorage.setItem("gameWithBot", "true");
    setGameMode("bot");
  };

  const handleBackToMenu = () => {
    setGameMode("menu");
    localStorage.removeItem("gameWithBot");
  };

  if (gameMode !== "menu") {
    return <PongGame onBackToMenu={handleBackToMenu} gameMode={gameMode} />;
  }

  return (
    <div className="bg-theme-bg-primary w-full h-screen flex items-center justify-center overflow-hidden relative">
      <TopRightBlurEffect />
      <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px] pointer-events-none" />
      <img
        className="absolute top-[-338px] left-[1235px] max-w-full w-[900px] pointer-events-none"
        alt="Ellipse"
        src="/ellipse-2.svg"
      />
      <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={() => redirect("/dashboard")}
        className="absolute top-8 left-8 z-20 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all duration-200"
      >
        ← Back to Dashboard
      </button>

      {/* Logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <img className="w-[200px]" alt="Logo" src={Logo} />
      </div>

      {/* Game Menu */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Pong Game
          </h1>
          <p className="text-xl text-white/70">Choose your game mode</p>
        </div>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <button
            onClick={handlePlayLocal}
            className="group relative px-8 py-6 bg-gradient-to-r from-[#dda15e] to-[#cc9455] hover:from-[#cc9455] hover:to-[#b8834a] rounded-xl text-[#141517] font-bold text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-[#dda15e]/50"
          >
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-3">
              <span>🎮</span>
              Play Local
            </span>
          </button>

          <button
            onClick={handlePlayRemote}
            className="group relative px-8 py-6 bg-gradient-to-r from-[#dda15e] to-[#cc9455] hover:from-[#cc9455] hover:to-[#b8834a] rounded-xl text-[#141517] font-bold text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-[#dda15e]/50"
          >
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-3">
              <span>🌐</span>
              Play Remote
            </span>
          </button>

          <button
            onClick={handlePlayBot}
            className="group relative px-8 py-6 bg-gradient-to-r from-[#dda15e] to-[#cc9455] hover:from-[#cc9455] hover:to-[#b8834a] rounded-xl text-[#141517] font-bold text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-[#dda15e]/50"
          >
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-3">
              <span>🤖</span>
              Play With a Bot
            </span>
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-white/60 max-w-lg">
          <p className="text-sm">
            <strong className="text-white">Local:</strong> Play with a friend on the same device
            <br />
            <strong className="text-white">Remote:</strong> Challenge online players
            <br />
            <strong className="text-white">Bot:</strong> Practice against AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Game;
