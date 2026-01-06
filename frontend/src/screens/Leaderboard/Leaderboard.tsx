import Fuego from "../../index";
import { useState } from "../../library/hooks/useState";
import { useEffect } from "../../library/hooks/useEffect";
import { Link, redirect } from "../../library/Router/Router";
import { getToken, clearToken } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";

import DashboardIcon from "../../assets/dd.svg";
import LeaderboardIcon from "../../assets/Leaderboard.svg";
import Game from "../../assets/game-icon.svg";
import ChatIcon from "../../assets/chat-icon.svg";
import TournamentIcon from "../../assets/Tournament-icon.svg";
import SettingsIcon from "../../assets/Settings.svg";
import LogOutIcon from "../../assets/Logout.svg";
import Logo from "../../assets/secondLogo.svg";

const navigationItems = [
  { label: "Dashboard", active: false, icon: DashboardIcon, path: "dashboard" },
  { label: "Game", active: false, icon: Game, path: "game" },
  { label: "Chat", active: false, icon: ChatIcon, path: "chat" },
  {
    label: "Tournament",
    active: false,
    icon: TournamentIcon,
    path: "tournament",
  },
  {
    label: "Leaderboard",
    active: true,
    icon: LeaderboardIcon,
    path: "leaderboard",
  },
  { label: "Settings", active: false, icon: SettingsIcon, path: "settings" },
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
      redirect("/");
    } else {
      wsService.connect();
      fetchLeaderboard();
    }
  }, [filter]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";
      const token = getToken();

      const response = await fetch(`${backend}/v1/leaderboard/global`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await response.json();
      
      // Transform backend data to match frontend Player interface
      const transformedData: Player[] = data.leaderboard.map((item: any) => ({
        rank: item.rank,
        id: item.userId,
        name: item.username,
        avatar: "",
        wins: 0, // These fields aren't in the backend yet
        losses: 0,
        score: item.exp,
      }));

      setPlayers(transformedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";
      const token = getToken();

      await fetch(`${backend}/v1/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    } catch (e) {
      console.warn("Logout request failed", e);
    }

    wsService.disconnect();
    clearToken();
    redirect("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  const getAvatarUrl = (path: string | null | undefined): string => {
    const backend =
      (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3000";
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
    <div className="bg-dark-950 w-full h-screen flex overflow-hidden">
      <TopRightBlurEffect />
      <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px] pointer-events-none" />
      <img
        className="absolute top-[-338px] left-[1235px] max-w-full w-[900px] pointer-events-none"
        alt="Ellipse"
        src="/ellipse-2.svg"
      />
      <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px] pointer-events-none" />

      <aside className="w-[300px] border-r-[1px] border-light border-opacity-[0.05] h-screen flex flex-col relative z-10 flex-shrink-0">
        <Link to="/">
          <div className="pt-[47px] pl-[43px] pb-[50px] flex items-center gap-3">
            <img className="w-[200px]" alt="Logo" src={Logo} />
          </div>
        </Link>

        <nav className="flex flex-col gap-[18px] px-[60px] relative flex-1">
          {navigationItems.map((item, index) => (
            <Link key={index} to={`/${item.path}`}>
              <div className="cursor-pointer flex items-center gap-3 px-3 py-2 w-full transition-all duration-150 hover:bg-white/5 rounded-lg">
                <div
                  className={`${
                    item.active
                      ? "bg-accent-green/20 border border-accent-green/50"
                      : "bg-transparent border border-white/10"
                  } rounded-full p-3 transition-all duration-150`}>
                  <img
                    src={item.icon}
                    alt={`${item.label} icon`}
                    className={`w-[15px] ${
                      item.active ? "opacity-100" : "opacity-30"
                    } transition-opacity duration-150`}
                  />
                </div>
                <span
                  className={`font-questrial font-normal text-base tracking-[0] leading-[15px] whitespace-nowrap ${
                    item.active ? "text-light" : "text-light/30"
                  } transition-colors duration-150`}>
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
        <div className="w-full max-w-layoutLg mx-auto px-layout py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-questrial font-normal text-light text-4xl mb-2">
                Global Leaderboard
              </h1>
              <p className="font-questrial text-light/60 text-base">
                Top players competing for glory
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg font-questrial font-semibold transition-colors ${
                  filter === "all"
                    ? "bg-accent-green text-dark-950"
                    : "bg-white/10 text-light hover:bg-white/20"
                }`}>
                All Time
              </button>
              <button
                onClick={() => setFilter("weekly")}
                className={`px-6 py-2 rounded-lg font-questrial font-semibold transition-colors ${
                  filter === "weekly"
                    ? "bg-accent-green text-dark-950"
                    : "bg-white/10 text-light hover:bg-white/20"
                }`}>
                Weekly
              </button>
              <button
                onClick={() => setFilter("monthly")}
                className={`px-6 py-2 rounded-lg font-questrial font-semibold transition-colors ${
                  filter === "monthly"
                    ? "bg-accent-green text-dark-950"
                    : "bg-white/10 text-light hover:bg-white/20"
                }`}>
                Monthly
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
            </div>          ) : players.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="font-questrial text-light text-2xl mb-2">
                  No user match the top 1 yet
                </h3>
                <p className="font-questrial text-light/60">
                  Be the first to earn experience points and claim the top spot!
                </p>
              </div>
            </div>          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 font-questrial text-light/60 font-semibold">
                        Rank
                      </th>
                      <th className="text-left py-4 px-6 font-questrial text-light/60 font-semibold">
                        Player
                      </th>
                      <th className="text-center py-4 px-6 font-questrial text-light/60 font-semibold">
                        Wins
                      </th>
                      <th className="text-center py-4 px-6 font-questrial text-light/60 font-semibold">
                        Losses
                      </th>
                      <th className="text-center py-4 px-6 font-questrial text-light/60 font-semibold">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr
                        key={player.id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                          player.rank <= 3 ? "bg-white/5" : ""
                        }`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-questrial font-bold ${getRankBadgeColor(
                                player.rank
                              )}`}>
                              {player.rank}
                            </span>
                            <span className="text-2xl">
                              {getRankIcon(player.rank)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={getAvatarUrl(player.avatar)}
                              alt={player.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                            />
                            <span className="font-questrial text-light text-lg font-semibold">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-questrial text-accent-green text-lg font-bold">
                            {player.wins}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-questrial text-red-400 text-lg font-bold">
                            {player.losses}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-questrial text-light text-lg font-bold">
                            {player.score}
                          </span>
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
