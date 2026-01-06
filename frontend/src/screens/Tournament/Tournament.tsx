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
  status: "CREATED" | "WAITING" | "IN_PROGRESS" | "FINISHED";
  maxPlayers: number;
  ownerId: string;
  currentRound: number | null;
  winnerId: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  owner?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  participants?: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;
  _count?: {
    matches: number;
  };
}

const Tournament = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      redirect("/");
    } else {
      wsService.connect();
      fetchTournaments();
      // Extract user ID from JWT token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.uid);
      } catch (error) {
        console.error("Failed to parse token:", error);
      }
    }
  }, []);

  const fetchFriends = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";
      const token = getToken();

      const response = await fetch(`${backend}/v1/friend`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  };

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";
      const token = getToken();

      const response = await fetch(`${backend}/v1/tournament`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTournaments(data.tournaments || []);
      } else {
        console.error("Failed to fetch tournaments:", response.statusText);
        setTournaments([]);
      }
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowDetailsModal(true);
  };

  const handleOpenInviteModal = async () => {
    await fetchFriends();
    setSelectedFriends([]);
    setShowInviteModal(true);
  };

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSendInvites = async () => {
    if (!selectedTournament || selectedFriends.length === 0) return;

    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3000";
      const token = getToken();

      const response = await fetch(
        `${backend}/v1/tournament/${selectedTournament.id}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            friendIds: selectedFriends,
          }),
        }
      );

      if (response.ok) {
        setShowInviteModal(false);
        setSelectedFriends([]);
        alert("Invitations sent successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Failed to send invites:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleCreateTournament = async () => {
    if (newTournamentName.trim()) {
      try {
        const backend =
          (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
          "http://localhost:3000";
        const token = getToken();

        const response = await fetch(`${backend}/v1/tournament`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            name: newTournamentName.trim(),
            maxPlayers: maxPlayers,
          }),
        });

        if (response.ok) {
          await fetchTournaments();
          setShowCreateModal(false);
          setNewTournamentName("");
          setMaxPlayers(4);
        } else {
          const error = await response.json();
          console.error("Failed to create tournament:", error);
          alert(error.message || "Failed to create tournament");
        }
      } catch (error) {
        console.error("Failed to create tournament:", error);
        alert("Network error. Please try again.");
      }
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

  const getStatusBadge = (status: Tournament["status"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 bg-accent-green/20 text-accent-green rounded-full text-sm font-questrial font-semibold">
            Live
          </span>
        );
      case "WAITING":
      case "CREATED":
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-questrial font-semibold">
            {status === "WAITING" ? "Waiting" : "Open"}
          </span>
        );
      case "FINISHED":
        return (
          <span className="px-3 py-1 bg-white/10 text-light/60 rounded-full text-sm font-questrial font-semibold">
            Finished
          </span>
        );
    }
  };

  const getStatusIcon = (status: Tournament["status"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return "🔴";
      case "WAITING":
      case "CREATED":
        return "📅";
      case "FINISHED":
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
            </div>          ) : tournaments.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="font-questrial text-light text-2xl mb-2">
                  No tournament have been created yet
                </h3>
                <p className="font-questrial text-light/60 mb-6">
                  Be the first to create a tournament and compete with other players!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                  Create First Tournament
                </button>
              </div>
            </div>          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tournaments.map((tournament) => {
                const participantCount = tournament.participants?.length || 0;
                return (
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
                            Created by {tournament.owner?.name || "Unknown"}
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
                          {participantCount}/{tournament.maxPlayers}
                        </span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-accent-green h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (participantCount / tournament.maxPlayers) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-questrial text-light/60">
                          Format
                        </span>
                        <span className="font-questrial text-light font-semibold">
                          Single Elimination
                        </span>
                      </div>
                    </div>

                    {tournament.status === "FINISHED" ? (
                      <button className="w-full py-3 bg-white/10 text-light/60 rounded-lg font-questrial font-semibold cursor-not-allowed">
                        Tournament Ended
                      </button>
                    ) : tournament.status === "IN_PROGRESS" ? (
                      <button className="w-full py-3 bg-accent-green/20 text-accent-green border border-accent-green/50 rounded-lg font-questrial font-semibold hover:bg-accent-green/30 transition-colors">
                        View Bracket
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinTournament(tournament)}
                        className="w-full py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                        View Details
                      </button>
                    )}
                  </div>
                );
              })}
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
                <select
                  value={maxPlayers}
                  onChange={(e: any) => setMaxPlayers(parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-light font-questrial focus:outline-none focus:border-accent-green">
                  <option value="4">4 Players</option>
                  <option value="8">8 Players</option>
                  <option value="16">16 Players</option>
                </select>
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

      {showDetailsModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-questrial text-light text-2xl mb-2">
                  {selectedTournament.name}
                </h2>
                <div className="flex items-center gap-2">
                  {selectedTournament.status === "CREATED" && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-questrial font-semibold">
                      Open
                    </span>
                  )}
                  {selectedTournament.status === "WAITING" && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-questrial font-semibold">
                      Waiting
                    </span>
                  )}
                  {selectedTournament.status === "IN_PROGRESS" && (
                    <span className="px-3 py-1 bg-accent-green/20 text-accent-green rounded-full text-sm font-questrial font-semibold">
                      Live
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-light/60 hover:text-light text-2xl">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-questrial text-light text-lg mb-3">
                  Tournament Info
                </h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-light/60 font-questrial">Owner</span>
                    <span className="text-light font-questrial">
                      {selectedTournament.owner?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light/60 font-questrial">
                      Max Players
                    </span>
                    <span className="text-light font-questrial">
                      {selectedTournament.maxPlayers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light/60 font-questrial">Format</span>
                    <span className="text-light font-questrial">
                      Single Elimination
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-questrial text-light text-lg mb-3">
                  Participants ({selectedTournament.participants?.length || 0}/
                  {selectedTournament.maxPlayers})
                </h3>
                <div className="bg-white/5 rounded-lg p-4">
                  {selectedTournament.participants &&
                  selectedTournament.participants.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTournament.participants.map((participant) => (
                        <div
                          key={participant.userId}
                          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green font-questrial font-bold">
                            {participant.user.name[0].toUpperCase()}
                          </div>
                          <span className="text-light font-questrial">
                            {participant.user.name}
                          </span>
                        </div>
                      ))}
                      {Array.from({
                        length:
                          selectedTournament.maxPlayers -
                          (selectedTournament.participants?.length || 0),
                      }).map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg opacity-50">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-light/40 font-questrial">
                            ?
                          </div>
                          <span className="text-light/40 font-questrial">
                            Empty slot
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light/60 font-questrial text-center py-4">
                      No participants yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {currentUserId === selectedTournament.ownerId &&
                (selectedTournament.status === "CREATED" ||
                  selectedTournament.status === "WAITING") && (
                  <button
                    onClick={handleOpenInviteModal}
                    className="flex-1 px-4 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                    Invite Friends
                  </button>
                )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-light rounded-lg font-questrial hover:bg-white/20 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="font-questrial text-light text-2xl mb-4">
              Invite Friends
            </h2>
            <p className="font-questrial text-light/60 mb-6">
              Select friends to invite to this tournament
            </p>

            {friends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-light/60 font-questrial">
                  No friends available to invite
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {friends.map((friend: any) => (
                  <div
                    key={friend.id}
                    onClick={() => handleToggleFriend(friend.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFriends.includes(friend.id)
                        ? "bg-accent-orange/20 border border-accent-orange/50"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}>
                    <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green font-questrial font-bold">
                      {friend.name[0].toUpperCase()}
                    </div>
                    <span className="text-light font-questrial flex-1">
                      {friend.name}
                    </span>
                    {selectedFriends.includes(friend.id) && (
                      <span className="text-accent-orange">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setSelectedFriends([]);
                }}
                className="flex-1 px-4 py-3 bg-white/10 text-light rounded-lg font-questrial hover:bg-white/20 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                disabled={selectedFriends.length === 0}
                className="flex-1 px-4 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Invite ({selectedFriends.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournament;
