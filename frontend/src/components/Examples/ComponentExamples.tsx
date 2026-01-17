/**
 * COMPONENT EXAMPLES & PATTERNS
 * Reference implementations for the design system
 */

import Fuego from "../../index";
import { AnimatedBackground } from "../AnimatedBackground/AnimatedBackground";
import { PremiumCard, PremiumCardHeader, PremiumCardBody, PremiumCardFooter } from "../PremiumCard/PremiumCard";
import { GlowButton } from "../GlowButton/GlowButton";
import StatusOrb from "../StatusOrb/StatusOrb";

/**
 * EXAMPLE 1: Hero Section with Animated Background
 */
export const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-gradient-dark overflow-hidden">
      <AnimatedBackground type="combined" intensity="medium" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white font-display mb-4 animate-fade-in">
          PONG RUSH
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl animate-slide-in-up">
          Next-Generation Esports Platform for Competitive Gaming
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-scale-in">
          <GlowButton variant="primary" size="lg">
            Start Tournament
          </GlowButton>
          <GlowButton variant="secondary" size="lg">
            View Leaderboard
          </GlowButton>
        </div>
      </div>
    </div>
  );
};

/**
 * EXAMPLE 2: Card Grid with Different Glow Colors
 */
export const CardGridExample = () => {
  const cards = [
    {
      title: "Quick Match",
      subtitle: "1v1 Ranked",
      icon: "⚡",
      color: "cyan",
      description: "Jump into a fast-paced match with instant opponent matchmaking.",
    },
    {
      title: "Tournament",
      subtitle: "Multi-Stage Competition",
      icon: "🏆",
      color: "purple",
      description: "Compete in structured tournaments with prize pools.",
    },
    {
      title: "Training",
      subtitle: "Skill Development",
      icon: "🎯",
      color: "lime",
      description: "Improve your skills with AI practice and tutorials.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 p-8">
      <h2 className="text-4xl font-bold text-white mb-12 text-center font-display">
        Game Modes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cards.map((card, index) => (
          <PremiumCard
            key={index}
            glowColor={card.color as "cyan" | "purple" | "lime"}
            gradient
            animated
          >
            <PremiumCardHeader
              title={card.title}
              subtitle={card.subtitle}
              icon={card.icon}
            />
            <PremiumCardBody>
              {card.description}
            </PremiumCardBody>
            <PremiumCardFooter align="right">
              <GlowButton variant="primary" size="sm">
                Play Now
              </GlowButton>
            </PremiumCardFooter>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
};

/**
 * EXAMPLE 3: Player Stats Dashboard
 */
export const PlayerStatsCard = ({ playerName = "Pro Player" }) => {
  return (
    <PremiumCard glowColor="cyan">
      <PremiumCardHeader
        title={playerName}
        subtitle="Current Season Stats"
        icon="🎮"
      />
      <PremiumCardBody className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Rank</span>
          <span className="text-cyan-400 font-mono font-semibold">Diamond II</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">ELO Rating</span>
          <span className="text-lime-400 font-mono font-semibold">2,450</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Win Rate</span>
          <span className="text-purple-400 font-mono font-semibold">76.5%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Total Matches</span>
          <span className="text-text-primary font-mono font-semibold">342</span>
        </div>
      </PremiumCardBody>
      <PremiumCardFooter align="between">
        <span className="text-xs text-text-tertiary">Last played: 2 hours ago</span>
        <GlowButton variant="secondary" size="sm">
          View Profile
        </GlowButton>
      </PremiumCardFooter>
    </PremiumCard>
  );
};

/**
 * EXAMPLE 4: Status Indicator with Header
 */
export const HeaderWithStatus = () => {
  const [status, setStatus] = Fuego.useState<"online" | "idle" | "offline" | "playing" | "spectating">("online");

  return (
    <header className="bg-dark-900 backdrop-blur-lg border-b border-border-subtle p-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">PONG RUSH</h1>
          <p className="text-text-secondary text-sm font-mono">Esports Platform</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-white font-semibold">Player Name</p>
            <p className="text-text-secondary text-sm">
              {status === "online" && "Available"}
              {status === "playing" && "In Match"}
              {status === "spectating" && "Spectating"}
              {status === "idle" && "Idle"}
              {status === "offline" && "Offline"}
            </p>
          </div>

          <StatusOrb
            userStatus={status}
            onStatusChange={(newStatus) => setStatus(newStatus as any)}
          />
        </div>
      </div>
    </header>
  );
};

/**
 * EXAMPLE 5: Match Card with Action Buttons
 */
export const MatchCard = ({
  player1 = "You",
  player2 = "Opponent",
  matchType = "Ranked 1v1",
  inProgress = false,
}) => {
  return (
    <PremiumCard glowColor="purple" gradient>
      <PremiumCardHeader
        title={matchType}
        subtitle={inProgress ? "In Progress" : "Upcoming"}
      />
      <PremiumCardBody className="space-y-4">
        <div className="flex items-center justify-between py-4 px-3 rounded-lg bg-dark-800">
          <div className="text-center flex-1">
            <p className="text-white font-semibold">{player1}</p>
            <p className="text-text-secondary text-sm">2,450 ELO</p>
          </div>
          <div className="text-cyan-400 font-bold text-2xl px-4">VS</div>
          <div className="text-center flex-1">
            <p className="text-white font-semibold">{player2}</p>
            <p className="text-text-secondary text-sm">2,380 ELO</p>
          </div>
        </div>

        {inProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Game Time</span>
              <span className="text-cyan-400 font-mono">4:32</span>
            </div>
            <div className="w-full bg-dark-800 rounded h-1">
              <div className="bg-gradient-cyan-purple h-1 rounded w-1/3" />
            </div>
          </div>
        )}
      </PremiumCardBody>
      <PremiumCardFooter align="between">
        {inProgress ? (
          <>
            <GlowButton variant="secondary" size="sm">
              Spectate
            </GlowButton>
            <GlowButton variant="danger" size="sm">
              Report Bug
            </GlowButton>
          </>
        ) : (
          <>
            <span className="text-text-secondary text-sm">Match starts in 3:45</span>
            <GlowButton variant="primary" size="sm">
              Join Now
            </GlowButton>
          </>
        )}
      </PremiumCardFooter>
    </PremiumCard>
  );
};

/**
 * EXAMPLE 6: Leaderboard Row
 */
export const LeaderboardRow = ({
  rank,
  playerName,
  elo,
  wins,
  isCurrentPlayer = false,
}) => {
  return (
    <div
      className={`
        flex items-center justify-between p-4 rounded-lg
        transition-all duration-300
        border border-opacity-30
        ${isCurrentPlayer
          ? "bg-gradient-cyan-purple border-cyan-500 shadow-glow-cyan"
          : "bg-dark-800 border-border-subtle hover:border-cyan-500"
        }
      `}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 h-8 rounded-full bg-gradient-cyan-purple flex items-center justify-center text-white font-bold text-sm">
          {rank}
        </div>
        <span className={`font-semibold ${isCurrentPlayer ? "text-dark-950" : "text-white"}`}>
          {playerName}
        </span>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className={`text-sm font-mono ${isCurrentPlayer ? "text-dark-950" : "text-lime-400"}`}>
            {elo} ELO
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-mono ${isCurrentPlayer ? "text-dark-950" : "text-text-secondary"}`}>
            {wins} Wins
          </p>
        </div>
        <GlowButton variant="primary" size="sm">
          Challenge
        </GlowButton>
      </div>
    </div>
  );
};

/**
 * EXAMPLE 7: Full Screen Dashboard
 */
export const CompleteDashboardExample = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <AnimatedBackground type="combined" intensity="light" />

      <div className="relative z-10">
        {/* Header */}
        <HeaderWithStatus />

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-white font-display mb-2">
              Welcome Back!
            </h2>
            <p className="text-text-secondary">Here's what's happening in your gaming world</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <PlayerStatsCard playerName="Your Stats" />
            <MatchCard inProgress={true} />
            <PremiumCard glowColor="lime">
              <PremiumCardHeader title="Achievements" subtitle="Season Progress" icon="🏅" />
              <PremiumCardBody>
                <p className="text-text-secondary text-sm">5 new badges unlocked</p>
              </PremiumCardBody>
            </PremiumCard>
          </div>

          {/* Recent Matches */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 font-display">Recent Matches</h3>
            <div className="space-y-4">
              <LeaderboardRow rank={1} playerName="You" elo={2450} wins={256} isCurrentPlayer />
              <LeaderboardRow rank={2} playerName="Pro Player" elo={2380} wins={234} />
              <LeaderboardRow rank={3} playerName="Champion" elo={2295} wins={198} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton variant="primary" size="lg">
              Start New Match
            </GlowButton>
            <GlowButton variant="secondary" size="lg">
              Join Tournament
            </GlowButton>
            <GlowButton variant="tertiary" size="lg">
              View Leaderboard
            </GlowButton>
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * USAGE IN YOUR APP
 *
 * Import and use any of these examples:
 *
 * import {
 *   HeroSection,
 *   CardGridExample,
 *   CompleteDashboardExample,
 *   HeaderWithStatus
 * } from "@/components/examples";
 *
 * export default function App() {
 *   return <CompleteDashboardExample />;
 * }
 */

export default CompleteDashboardExample;
