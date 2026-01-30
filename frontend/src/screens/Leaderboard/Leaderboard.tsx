import React, { useState, useEffect } from "react";
import { Link, redirect } from "../../router";
import { getToken, clearToken, decodeTokenPayload } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import { fetchWithAuth } from "../../lib/fetch";
import { API_CONFIG } from "../../config/api";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import MobileNavigation from "../../components/Navigation/MobileNavigation";

import DashboardIcon from "../../assets/dd.svg";
import LeaderboardIcon from "../../assets/Leaderboard.svg";
import ChatIcon from "../../assets/chat-icon.svg";
import GameIcon from "../../assets/game-icon.svg";
import SettingsIcon from "../../assets/Settings.svg";
import LogOutIcon from "../../assets/Logout.svg";
import CareerIcon from "../../assets/view-profile.svg";
import Logo from "../../assets/secondLogo.svg";

const navigationItems = [
  { label: "Dashboard", active: false, icon: DashboardIcon, path: "/dashboard" },
  { label: "Chat", active: false, icon: ChatIcon, path: "/chat" },
  { label: "PingPong", active: false, icon: GameIcon, path: "/game" },
  {
    label: "Leaderboard",
    active: true,
    icon: LeaderboardIcon,
    path: "/leaderboard",
  },
  { label: "Career", active: false, icon: CareerIcon, path: "/career" },
  { label: "Settings", active: false, icon: SettingsIcon, path: "/settings" },
];

interface Player {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  wins: number;
  losses: number;
  score: number;
}

const Leaderboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<"all" | "weekly" | "monthly">("all");
  const [isLoading, setIsLoading] = useState(true);

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
      wsService.connect();
      fetchLeaderboard();
    }
  }, [filter]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/leaderboard/top10`);

      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await res.json();

      // Transform API data to Player interface
      // Assuming API returns { id, name, avatar, xp }
      const formattedData: Player[] = data.map((user: any, index: number) => ({
        rank: index + 1,
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        wins: 0, // Wins/Losses not yet in API, defaulting to 0 or could remove column
        losses: 0,
        score: user.xp || 0, // Using XP as score
      }));

      setPlayers(formattedData);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchWithAuth(API_CONFIG.AUTH.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Logout request failed", e);
    }

    wsService.disconnect();
    clearToken();
    redirect("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

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

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-accent-green text-dark-950";
    if (rank === 2) return "bg-accent-orange text-dark-950";
    if (rank === 3) return "bg-gray-400 text-dark-950";
    return "bg-white/10 text-light";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
      {/* Fixed Background Layer with Parallax Effect */}
      <div
        className="fixed inset-0 w-full h-full bg-dark-950 z-0"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Decorative gradient overlays */}
        <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px] pointer-events-none opacity-30" />
        <div className="absolute top-[-338px] left-[1235px] w-[900px] h-[900px] bg-gradient-radial from-[#dda15e40] to-transparent rounded-full blur-[153px] pointer-events-none" />
        <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px] pointer-events-none opacity-40" />
      </div>

      <TopRightBlurEffect />

      {/* Mobile Navigation */}
      <MobileNavigation
        navigationItems={navigationItems}
        userAvatar={<div className="w-16 h-16 bg-white/10 rounded-full" />}
        onLogout={handleLogout}
      />

      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <aside className="hidden lg:flex w-[300px] border-r-[1px] border-light border-opacity-[0.05] min-h-screen flex-col relative z-20 flex-shrink-0 bg-dark-950/80 backdrop-blur-xl">
        <Link to="/">
          <div className="pt-[47px] pl-[43px] pb-[50px] flex items-center gap-3">
            <img className="w-[200px]" alt="Logo" src={Logo} />
          </div>
        </Link>

        <nav className="flex flex-col gap-[18px] px-[60px] relative flex-1">
          {navigationItems.map((item, index) => (
            <Link key={index} to={item.path}>
              <div className="cursor-pointer flex items-center gap-3 px-3 py-2 w-full transition-all duration-150 hover:bg-white/5 rounded-lg">
                <div
                  className={(item.active
                    ? "bg-accent-green/20 border border-accent-green/50"
                    : "bg-transparent border border-white/10"
                  ) + " rounded-full p-2 md:p-3 transition-all duration-150"}>
                  <img
                    src={item.icon}
                    alt={item.label + " icon"}
                    className={"w-[15px] " + (item.active ? "opacity-100" : "opacity-30") + " transition-opacity duration-150"}
                  />
                </div>
                <span
                  className={"font-questrial font-normal text-base tracking-[0] leading-[15px] whitespace-nowrap " + (item.active ? "text-light" : "text-light/30") + " transition-colors duration-150"}>
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto mb-[50px] px-[60px]">
          <button
            onClick={handleLogout}
            className="w-full p-3 bg-transparent border border-solid border-[#f9f9f94c] rounded-[14px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all duration-150">
            <img src={LogOutIcon} alt="logout icon" className="w-4 h-4" />
            <span className="text-light font-questrial">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex h-full relative z-10 overflow-y-auto">
        <div className="w-full max-w-layoutLg mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Header Section - Responsive */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            {/* Title */}
            <div>
              <h1 className="font-questrial font-normal text-light text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">
                Global Leaderboard
              </h1>
              <p className="font-questrial text-light/60 text-sm sm:text-base">
                Top players competing for glory
              </p>
            </div>

            {/* Filter Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilter("all")}
                className={"min-h-[44px] px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-questrial font-semibold transition-colors text-sm sm:text-base " + (filter === "all"
                  ? "bg-accent-green text-dark-950"
                  : "bg-white/10 text-light hover:bg-white/20 active:bg-white/30"
                ) + ""}>
                All Time
              </button>
              <button
                onClick={() => setFilter("weekly")}
                className={"min-h-[44px] px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-questrial font-semibold transition-colors text-sm sm:text-base " + (filter === "weekly"
                  ? "bg-accent-green text-dark-950"
                  : "bg-white/10 text-light hover:bg-white/20 active:bg-white/30"
                ) + ""}>
                Weekly
              </button>
              <button
                onClick={() => setFilter("monthly")}
                className={"min-h-[44px] px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-questrial font-semibold transition-colors text-sm sm:text-base " + (filter === "monthly"
                  ? "bg-accent-green text-dark-950"
                  : "bg-white/10 text-light hover:bg-white/20 active:bg-white/30"
                ) + ""}>
                Monthly
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
            </div>
          ) : players.length === 0 || players[0].score === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">🏆</span>
              </div>
              <h3 className="font-questrial text-light text-lg sm:text-xl mb-2">
                No one has reached XP yet
              </h3>
              <p className="font-questrial text-light/60 text-sm sm:text-base">
                Be the first to play a game and claim your spot on the leaderboard!
              </p>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-questrial text-light/60 font-semibold text-xs sm:text-sm w-20 sm:w-24">
                        Rank
                      </th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-questrial text-light/60 font-semibold text-xs sm:text-sm">
                        Player
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-questrial text-light/60 font-semibold text-xs sm:text-sm">
                        XP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr
                        key={player.id}
                        className={"border-b border-white/5 hover:bg-white/5 transition-colors " + (player.rank <= 3 ? "bg-white/5" : ""
                        ) + ""}>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span
                              className={"w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-questrial font-bold text-xs sm:text-sm " + (getRankBadgeColor(
                                player.rank
                              )) + ""}>
                              {player.rank}
                            </span>
                            <span className="text-base sm:text-xl">
                              {getRankIcon(player.rank)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <img
                              src={getAvatarUrl(player.avatar)}
                              alt={player.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/20 bg-gray-700"
                            />
                            <span className="font-questrial text-light text-sm sm:text-lg font-semibold truncate max-w-[120px] sm:max-w-none">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-accent-green/10 px-2 sm:px-3 py-1 rounded-full border border-accent-green/20">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent-green animate-pulse" />
                            <span className="font-questrial text-accent-green text-sm sm:text-lg font-bold whitespace-nowrap">
                              {player.score} XP
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
