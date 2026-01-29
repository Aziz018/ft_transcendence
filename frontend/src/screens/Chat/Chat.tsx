import React, { useState, useEffect } from "react";
import { Link, redirect } from "../../router";
import { getToken, clearToken, decodeTokenPayload } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import { chatService, type Friend } from "../../services/chatService";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import FriendsList from "./sections/FriendsList";
import ChatMain from "./sections/ChatMain";
import DashboardIcon from "../../assets/dd.svg";
import LeaderboardIcon from "../../assets/Leaderboard.svg";
import ChatIcon from "../../assets/chat-icon.svg";
import SettingsIcon from "../../assets/Settings.svg";
import LogOutIcon from "../../assets/Logout.svg";
import Logo from "../../assets/secondLogo.svg";

const navigationItems = [
  { label: "Dashboard", active: false, icon: DashboardIcon, path: "dashboard" },
  { label: "Chat", active: true, icon: ChatIcon, path: "chat" },
  {
    label: "Leaderboard",
    active: false,
    icon: LeaderboardIcon,
    path: "leaderboard",
  },
  { label: "Settings", active: false, icon: SettingsIcon, path: "settings" },
];

const Chat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

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
      chatService.connectWebSocket(token);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "/api";
      const token = getToken();

      await fetch(`${backend}/v1/auth/logout`, {
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
    chatService.disconnectWebSocket();
    clearToken();
    redirect("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-theme-bg-primary w-full h-screen flex overflow-hidden">
      <TopRightBlurEffect />
      <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px] pointer-events-none" />
      <img
        className="absolute top-[-338px] left-[1235px] max-w-full w-[900px] pointer-events-none"
        alt="Ellipse"
        src="/ellipse-2.svg"
      />
      <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px] pointer-events-none" />

      <aside className="w-full md:w-[250px] lg:w-[300px] border-r-[1px] border-[#F9F9F9] border-opacity-[0.05] min-h-screen flex flex-col relative z-10 flex-shrink-0">
        <Link to="/">
          <div className="pt-6 md:pt-[47px] pl-4 md:pl-8 lg:pl-[43px] pb-6 md:pb-[50px] flex items-center gap-3">
            <img className="w-[150px] md:w-[180px] lg:w-[200px]" alt="Logo" src={Logo} />
          </div>
        </Link>

        <nav className="flex flex-col gap-3 md:gap-[18px] px-4 md:px-8 lg:px-[60px] relative flex-1">
          {navigationItems.map((item, index) => (
            <Link key={index} to={"/" + item.path}>
              <div className="cursor-pointer flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 w-full transition-all duration-150 hover:bg-white/5 rounded-lg">
                <div
                  className={(item.active
                    ? "bg-blue-600/20 border border-blue-600/50"
                    : "bg-transparent border border-white/10"
                    ) + " rounded-full p-2 md:p-3 transition-all duration-150"}>
                  <img
                    src={item.icon}
                    alt={item.label + " icon"}
                    className={"w-3 md:w-[15px] " + (item.active ? "opacity-100" : "opacity-30") + " transition-opacity duration-150"}
                  />
                </div>
                <span
                  className={"[font-family:'Questrial',Helvetica] font-normal text-sm md:text-base tracking-[0] leading-[15px] whitespace-nowrap " + (item.active ? "text-white" : "text-white/30") + " transition-colors duration-150"}>
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto mb-6 md:mb-[50px] px-4 md:px-8 lg:px-[60px]">
          <button
            onClick={handleLogout}
            className="w-full p-2 md:p-3 bg-transparent border border-solid border-[#f9f9f94c] rounded-[14px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all duration-150">
            <img src={LogOutIcon} alt="logout icon" className="w-4 h-4" />
            <span className="text-white font-[Questrial]">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex h-full relative z-10">
        <FriendsList
          selectedFriend={selectedFriend}
          onSelectFriend={setSelectedFriend}
        />

        <ChatMain selectedFriend={selectedFriend} />
      </div>
    </div>
  );
};

export default Chat;
