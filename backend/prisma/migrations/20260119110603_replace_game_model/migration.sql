/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Game";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameType" TEXT NOT NULL DEFAULT 'CLASSIC',
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "player1Id" TEXT,
    "player2Id" TEXT,
    "winnerId" TEXT,
    "player1Score" INTEGER NOT NULL DEFAULT 0,
    "player2Score" INTEGER NOT NULL DEFAULT 0,
    "player1Exp" INTEGER,
    "player2Exp" INTEGER,
    "durationMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalLosses" INTEGER NOT NULL DEFAULT 0,
    "totalDraws" INTEGER NOT NULL DEFAULT 0,
    "winStreak" INTEGER NOT NULL DEFAULT 0,
    "bestWinStreak" INTEGER NOT NULL DEFAULT 0,
    "totalExpEarned" INTEGER NOT NULL DEFAULT 0,
    "averageGameDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GameHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameSessionId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "winnerId" TEXT,
    "player1Name" TEXT NOT NULL,
    "player2Name" TEXT NOT NULL,
    "player1Score" INTEGER NOT NULL,
    "player2Score" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "GameSession_status_createdAt_idx" ON "GameSession"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GameSession_player1Id_player2Id_idx" ON "GameSession"("player1Id", "player2Id");

-- CreateIndex
CREATE INDEX "GameSession_winnerId_idx" ON "GameSession"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStats_userId_key" ON "PlayerStats"("userId");

-- CreateIndex
CREATE INDEX "PlayerStats_totalWins_totalGames_idx" ON "PlayerStats"("totalWins", "totalGames");

-- CreateIndex
CREATE UNIQUE INDEX "GameHistory_gameSessionId_key" ON "GameHistory"("gameSessionId");

-- CreateIndex
CREATE INDEX "GameHistory_playedAt_idx" ON "GameHistory"("playedAt");

-- CreateIndex
CREATE INDEX "GameHistory_player1Id_playedAt_idx" ON "GameHistory"("player1Id", "playedAt");

-- CreateIndex
CREATE INDEX "GameHistory_player2Id_playedAt_idx" ON "GameHistory"("player2Id", "playedAt");

-- CreateIndex
CREATE INDEX "GameHistory_winnerId_playedAt_idx" ON "GameHistory"("winnerId", "playedAt");
