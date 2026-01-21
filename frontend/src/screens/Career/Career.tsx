import Fuego from "../../index";
import { useState } from "../../library/hooks/useState";
import { useEffect } from "../../library/hooks/useEffect";
import { Link, redirect } from "../../library/Router/Router";
import { getToken, clearToken, decodeTokenPayload } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import { API_CONFIG } from "../../config/api";
import { fetchWithAuth } from "../../lib/fetch";
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
    { label: "Tournament", active: false, icon: TournamentIcon, path: "tournament" },
    { label: "Leaderboard", active: false, icon: LeaderboardIcon, path: "leaderboard" },
    { label: "Career", active: true, icon: LeaderboardIcon, path: "career" }, // Reusing Icon for now or find a new one?
    { label: "Settings", active: false, icon: SettingsIcon, path: "settings" },
];

interface Match {
    id: string;
    gameType: string;
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    // Enriched fields from backend
    player1Exp: number;
    player2Exp: number;
    player1Name: string;
    player2Name: string;
    player1Avatar: string;
    player2Avatar: string;
    winnerId: string | null;
    playedAt: string;
}

const Career = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setIsAuthenticated(false);
            redirect("/login");
        } else {
            const payload = decodeTokenPayload(token);
            if (payload) {
                if (payload.mfa_required) {
                    redirect("/secondary-login");
                    return;
                }
                setUserId(payload.uid);
                fetchHistory(payload.uid);
            }
        }
    }, []);

    const fetchHistory = async (uid: string) => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(API_CONFIG.GAME.HISTORY(uid));

            if (!res.ok) {
                throw new Error("Failed to fetch history");
            }

            const data = await res.json();
            setMatches(data.games || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
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
        } catch (e) { console.warn("Logout failed", e); }
        wsService.disconnect();
        clearToken();
        redirect("/login");
    };

    if (!isAuthenticated) return null;

    const getAvatarUrl = (path: string | null | undefined): string => {
        const backend = (import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api";
        if (!path || !path.trim()) return `${backend}/images/default-avatar.png`;
        if (path.startsWith("/public/")) return `${backend}${path.replace("/public", "")}`;
        if (path.startsWith("/")) return `${backend}${path}`;
        return path.startsWith("http") ? path : `${backend}/images/default-avatar.png`;
    };

    const getOutcomeStyle = (match: Match) => {
        if (!userId) return "";
        const isWinner = match.winnerId === userId;
        const isTie = !match.winnerId;

        if (isWinner) return "text-accent-green";
        if (isTie) return "text-yellow-500";
        return "text-red-500";
    };

    const getOpponent = (match: Match) => {
        if (!userId) return { name: "Unknown", avatar: "" };
        if (match.player1Id === userId) {
            return { name: match.player2Name || "Unknown", avatar: match.player2Avatar };
        }
        return { name: match.player1Name || "Unknown", avatar: match.player1Avatar };
    };

    return (
        <div className="bg-dark-950 w-full h-screen flex overflow-hidden">
            <TopRightBlurEffect />
            <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px] pointer-events-none" />
            <img className="absolute top-[-338px] left-[1235px] max-w-full w-[900px] pointer-events-none" alt="Ellipse" src="/ellipse-2.svg" />
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
                                <div className={`${item.active ? "bg-accent-green/20 border border-accent-green/50" : "bg-transparent border border-white/10"} rounded-full p-3 transition-all duration-150`}>
                                    <img src={item.icon} alt={`${item.label} icon`} className={`w-[15px] ${item.active ? "opacity-100" : "opacity-30"} transition-opacity duration-150`} />
                                </div>
                                <span className={`font-questrial font-normal text-base whitespace-nowrap ${item.active ? "text-light" : "text-light/30"} transition-colors duration-150`}>
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto mb-[50px] px-[60px]">
                    <button onClick={handleLogout} className="w-full p-3 bg-transparent border border-solid border-[#f9f9f94c] rounded-[14px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all duration-150">
                        <img src={LogOutIcon} alt="logout icon" className="w-4 h-4" />
                        <span className="text-light font-questrial">Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex h-full relative z-10 overflow-y-auto">
                <div className="w-full max-w-layoutLg mx-auto px-layout py-12">
                    <div className="mb-8">
                        <h1 className="font-questrial font-normal text-light text-4xl mb-2">My Career</h1>
                        <p className="font-questrial text-light/60 text-base">History of your matches and performance.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎮</span>
                            </div>
                            <h3 className="font-questrial text-light text-xl mb-2">No matches yet</h3>
                            <p className="font-questrial text-light/60">Play a game to start your career!</p>
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-6 font-questrial text-light/60 font-semibold">Date</th>
                                            <th className="text-left py-4 px-6 font-questrial text-light/60 font-semibold">Opponent</th>
                                            <th className="text-center py-4 px-6 font-questrial text-light/60 font-semibold">Result</th>
                                            <th className="text-center py-4 px-6 font-questrial text-light/60 font-semibold">Score</th>
                                            <th className="text-right py-4 px-6 font-questrial text-light/60 font-semibold">XP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matches.map((match) => {
                                            const opponent = getOpponent(match);
                                            const isWinner = match.winnerId === userId;
                                            const outcomeText = isWinner ? "WIN" : (match.winnerId ? "LOSS" : "TIE");
                                            const userScore = match.player1Id === userId ? match.player1Score : match.player2Score;
                                            const opScore = match.player1Id === userId ? match.player2Score : match.player1Score;
                                            const xp = match.player1Id === userId ? match.player1Exp : match.player2Exp;

                                            return (
                                                <tr key={match.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-6 text-light/80 font-questrial">
                                                        {new Date(match.playedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <img src={getAvatarUrl(opponent.avatar)} alt={opponent.name} className="w-8 h-8 rounded-full object-cover bg-gray-700" />
                                                            <span className="font-questrial text-light font-medium">{opponent.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`py-4 px-6 text-center font-bold font-questrial ${getOutcomeStyle(match)}`}>
                                                        {outcomeText}
                                                    </td>
                                                    <td className="py-4 px-6 text-center text-light font-questrial font-medium">
                                                        {userScore} - {opScore}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className="text-accent-green font-bold font-questrial">+{xp || 0} XP</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

export default Career;
