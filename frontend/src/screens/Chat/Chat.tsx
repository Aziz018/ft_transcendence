import React, { useState, useEffect } from "react";
import { Link, redirect } from "../../router";
import { getToken, clearToken, decodeTokenPayload } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import { chatService, type Friend } from "../../services/chatService";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import MobileNavigation from "../../components/Navigation/MobileNavigation";
import FriendsList from "./sections/FriendsList";
import ChatMain from "./sections/ChatMain";
import DashboardIcon from "../../assets/dd.svg";
import LeaderboardIcon from "../../assets/Leaderboard.svg";
import ChatIcon from "../../assets/chat-icon.svg";
import GameIcon from "../../assets/game-icon.svg";
import SettingsIcon from "../../assets/Settings.svg";
import LogOutIcon from "../../assets/Logout.svg";
import Logo from "../../assets/secondLogo.svg";

const navigationItems = [
  { label: "Dashboard", active: false, icon: DashboardIcon, path: "/dashboard" },
  { label: "Chat", active: true, icon: ChatIcon, path: "/chat" },
  { label: "PingPong", active: false, icon: GameIcon, path: "/game" },
  {
    label: "Leaderboard",
    active: false,
    icon: LeaderboardIcon,
    path: "/leaderboard",
  },
  { label: "Settings", active: false, icon: SettingsIcon, path: "/settings" },
];

const Chat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

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

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    // On mobile, switch to chat view when friend is selected
    setShowMobileChat(true);
  };

  const handleBackToFriends = () => {
    setShowMobileChat(false);
  };

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
    <div className="bg-theme-bg-primary w-full h-screen flex overflow-hidden relative">
      {/* Fixed Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <TopRightBlurEffect />
        <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px]" />
        <img
          className="absolute top-[-338px] left-[1235px] max-w-full w-[900px]"
          alt="Ellipse"
          src="/ellipse-2.svg"
        />
        <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px]" />
      </div>

      {/* Mobile Navigation - Hamburger Menu */}
      <MobileNavigation
        navigationItems={navigationItems}
        userAvatar={null}
        onLogout={handleLogout}
      />

      {/* Desktop Navigation Sidebar - Hidden on mobile/tablet */}
      <aside className="hidden lg:flex lg:w-[300px] border-r-[1px] border-[#F9F9F9] border-opacity-[0.05] min-h-screen flex-col relative z-10 flex-shrink-0">
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
                  className={
                    item.active
                      ? "bg-blue-600/20 border border-blue-600/50 rounded-full p-3 transition-all duration-150"
                      : "bg-transparent border border-white/10 rounded-full p-3 transition-all duration-150"
                  }>
                  <img
                    src={item.icon}
                    alt={item.label + " icon"}
                    className={
                      "w-[15px] " +
                      (item.active ? "opacity-100" : "opacity-30") +
                      " transition-opacity duration-150"
                    }
                  />
                </div>
                <span
                  className={
                    "[font-family:'Questrial',Helvetica] font-normal text-base tracking-[0] leading-[15px] whitespace-nowrap " +
                    (item.active ? "text-white" : "text-white/30") +
                    " transition-colors duration-150"
                  }>
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
            <span className="text-white font-[Questrial]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area - Three Panel Layout */}
      <div className="flex-1 flex h-full relative z-10">
        {/* Friends List Panel - Responsive behavior */}
        <div
          className={`
            ${showMobileChat ? 'hidden md:flex' : 'flex'} 
            w-full md:w-[35%] lg:w-80 
            transition-all duration-300 ease-in-out
          `}>
          <FriendsList
            selectedFriend={selectedFriend}
            onSelectFriend={handleSelectFriend}
          />
        </div>

        {/* Chat Main Panel - Responsive behavior */}
        <div
          className={`
            ${showMobileChat ? 'flex' : 'hidden md:flex'} 
            flex-1 
            transition-all duration-300 ease-in-out
          `}>
          <ChatMain 
            selectedFriend={selectedFriend}
            onBack={handleBackToFriends}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
