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
    active: true,
    icon: TournamentIcon,
    path: "tournament",
  },
  {
    label: "Leaderboard",
    active: false,
    icon: LeaderboardIcon,
    path: "leaderboard",
  },
  { label: "Settings", active: false, icon: SettingsIcon, path: "settings" },
];

interface Tournament {
  id: string;
  name: string;
  status: "ongoing" | "upcoming" | "finished";
  currentPlayers: number;
  maxPlayers: number;
  startDate: string;
  prize: string;
}

const Tournament = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      redirect("/");
    } else {
      wsService.connect();
      fetchTournaments();
    }
  }, []);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3001";
      const token = getToken();

      const mockData: Tournament[] = [
        {
          id: "1",
          name: "Spring Championship 2025",
          status: "ongoing",
          currentPlayers: 12,
          maxPlayers: 16,
          startDate: "2025-10-20",
          prize: "1000 Points",
        },
        {
          id: "2",
          name: "Weekend Warriors Cup",
          status: "upcoming",
          currentPlayers: 6,
          maxPlayers: 16,
          startDate: "2025-10-27",
          prize: "500 Points",
        },
        {
          id: "3",
          name: "Elite Masters Series",
          status: "upcoming",
          currentPlayers: 4,
          maxPlayers: 8,
          startDate: "2025-11-01",
          prize: "2000 Points",
        },
        {
          id: "4",
          name: "October Showdown",
          status: "finished",
          currentPlayers: 16,
          maxPlayers: 16,
          startDate: "2025-10-10",
          prize: "750 Points",
        },
      ];

      setTimeout(() => {
        setTournaments(mockData);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
      setIsLoading(false);
    }
  };

  const handleJoinTournament = (tournamentId: string) => {
    console.log("Joining tournament:", tournamentId);
  };

  const handleCreateTournament = () => {
    if (newTournamentName.trim()) {
      console.log("Creating tournament:", newTournamentName);
      setShowCreateModal(false);
      setNewTournamentName("");
    }
  };

  const handleLogout = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3001";
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

  const getStatusBadge = (status: Tournament["status"]) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="px-3 py-1 bg-accent-green/20 text-accent-green rounded-full text-sm font-questrial font-semibold">
            Live
          </span>
        );
      case "upcoming":
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-questrial font-semibold">
            Upcoming
          </span>
        );
      case "finished":
        return (
          <span className="px-3 py-1 bg-white/10 text-light/60 rounded-full text-sm font-questrial font-semibold">
            Finished
          </span>
        );
    }
  };

  const getStatusIcon = (status: Tournament["status"]) => {
    switch (status) {
      case "ongoing":
        return "🔴";
      case "upcoming":
        return "📅";
      case "finished":
        return "✅";
    }
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
                Tournaments
              </h1>
              <p className="font-questrial text-light/60 text-base">
                Join competitive tournaments and win amazing prizes
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
              Create Tournament
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {getStatusIcon(tournament.status)}
                      </span>
                      <div>
                        <h3 className="font-questrial text-light text-xl font-semibold">
                          {tournament.name}
                        </h3>
                        <p className="font-questrial text-light/60 text-sm">
                          Starting{" "}
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="font-questrial text-light/60">
                        Players
                      </span>
                      <span className="font-questrial text-light font-semibold">
                        {tournament.currentPlayers}/{tournament.maxPlayers}
                      </span>
                    </div>

                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent-green h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (tournament.currentPlayers /
                              tournament.maxPlayers) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-questrial text-light/60">
                        Prize Pool
                      </span>
                      <span className="font-questrial text-accent-orange font-bold">
                        {tournament.prize}
                      </span>
                    </div>
                  </div>

                  {tournament.status === "finished" ? (
                    <button className="w-full py-3 bg-white/10 text-light/60 rounded-lg font-questrial font-semibold cursor-not-allowed">
                      Tournament Ended
                    </button>
                  ) : tournament.status === "ongoing" ? (
                    <button className="w-full py-3 bg-accent-green/20 text-accent-green border border-accent-green/50 rounded-lg font-questrial font-semibold hover:bg-accent-green/30 transition-colors">
                      View Details
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinTournament(tournament.id)}
                      className="w-full py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                      Join Tournament
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isLoading && tournaments.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <span className="text-6xl mb-4">🏆</span>
              <p className="font-questrial text-light/60 text-lg">
                No tournaments available at the moment
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                Create First Tournament
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="font-questrial text-light text-2xl mb-4">
              Create New Tournament
            </h2>
            <p className="font-questrial text-light/60 mb-6">
              Set up your tournament details
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-light/60 text-sm font-questrial mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={newTournamentName}
                  onChange={(e: any) => setNewTournamentName(e.target.value)}
                  placeholder="Enter tournament name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-light font-questrial focus:outline-none focus:border-accent-green"
                />
              </div>

              <div>
                <label className="block text-light/60 text-sm font-questrial mb-2">
                  Max Players
                </label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-light font-questrial focus:outline-none focus:border-accent-green">
                  <option value="8">8 Players</option>
                  <option value="16">16 Players</option>
                  <option value="32">32 Players</option>
                </select>
              </div>

              <div>
                <label className="block text-light/60 text-sm font-questrial mb-2">
                  Prize Pool
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1000 Points"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-light font-questrial focus:outline-none focus:border-accent-green"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-light rounded-lg font-questrial hover:bg-white/20 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                className="flex-1 px-4 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournament;
