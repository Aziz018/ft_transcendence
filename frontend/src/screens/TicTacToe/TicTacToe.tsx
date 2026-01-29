import React, { useState } from "react";
import { redirect } from "../../router";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import Logo from "../../assets/secondLogo.svg";

type Player = "X" | "O" | null;

const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = (squares: Player[]) => {
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else if (!newBoard.includes(null)) {
      setIsDraw(true);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setIsDraw(false);
  };

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

      {/* Game Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Tic Tac Toe
          </h1>
          {!winner && !isDraw && (
            <p className="text-xl text-white/70">
              Current Player: <span className="text-[#dda15e] font-bold">{currentPlayer}</span>
            </p>
          )}
          {winner && (
            <p className="text-2xl text-[#dda15e] font-bold animate-pulse">
              🎉 Player {winner} Wins! 🎉
            </p>
          )}
          {isDraw && (
            <p className="text-2xl text-white/70 font-bold">
              It's a Draw!
            </p>
          )}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-3 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!cell || !!winner || isDraw}
              className="w-24 h-24 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg text-5xl font-bold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {cell === "X" && <span className="text-[#dda15e]">X</span>}
              {cell === "O" && <span className="text-blue-400">O</span>}
            </button>
          ))}
        </div>

        {/* Reset Button */}
        {(winner || isDraw) && (
          <button
            onClick={resetGame}
            className="px-8 py-4 bg-gradient-to-r from-[#dda15e] to-[#cc9455] hover:from-[#cc9455] hover:to-[#b8834a] rounded-xl text-[#141517] font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Play Again
          </button>
        )}

        {/* Instructions */}
        <div className="text-center text-white/60 max-w-lg">
          <p className="text-sm">
            Click on any empty cell to place your mark. Get three in a row to win!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
