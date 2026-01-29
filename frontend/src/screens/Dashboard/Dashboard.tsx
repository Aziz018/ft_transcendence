import React, { useEffect } from "react";
import { fetchWithAuth } from "../../lib/fetch";
import Logo from "../../assets/secondLogo.svg";
import Avatar from "../../assets/Ellipse 46.svg";
import DashboardIcon from "../../assets/dd.svg";
import LeaderboardIcon from "../../assets/Leaderboard.svg";
import ChatIcon from "../../assets/chat-icon.svg";
import GameIcon from "../../assets/game-icon.svg";
import SettingsIcon from "../../assets/Settings.svg";
import LogOutIcon from "../../assets/Logout.svg";
import WelcomeHeaderSection from "./sections/WelcomeHeaderSection";
import PongrushGameShowcaseSection from "./sections/PongrushGameShowcaseSection";
import StatsSection from "./sections/StatsSection";
import DashboardSection from "./sections/DashboardSection";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import { getToken, decodeTokenPayload, clearToken } from "../../lib/auth";
import { Link, redirect } from "../../router";
// import { Button } from "../../components/ui/button";
import { API_CONFIG } from "../../config/api";

const navigationItems = [
  { label: "Dashboard", active: true, icon: DashboardIcon, path: "/dashboard" },
  { label: "Chat", active: false, icon: ChatIcon, path: "/chat" },
  { label: "Game", active: false, icon: GameIcon, path: "/game" },
  { label: "Leaderboard", active: false, icon: LeaderboardIcon, path: "/leaderboard" },
  { label: "Settings", active: false, icon: SettingsIcon, path: "/settings" },
];

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  const [userAvatar, setUserAvatar] = React.useState("");
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

  // Check if user is authenticated and fetch profile
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
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetchWithAuth(API_CONFIG.USER.PROFILE);

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMsg = errorData?.message || errorData?.error || errorMsg;
          } else {
            const text = await res.text();
            errorMsg = text || errorMsg;
          }
        } catch (parseErr) {
          console.error("[Profile] Could not parse error response", parseErr);
        }
        console.error(`[Profile] Request failed: ${errorMsg}`);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.error(`[Profile] Expected JSON but got ${contentType}`);
        return;
      }

      const data = await res.json();
      setUserAvatar(data?.avatar || "");
    } catch (error) {
      console.error("[Profile] Network or parsing error:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Only show content if authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getAvatarUrl = (path: string | null | undefined): string => {
    const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=FF6B35&color=fff&size=128";
    if (!path || !path.trim()) return defaultAvatar;
    if (path.startsWith("/public/"))
      return `/api${path.replace("/public", "")}`;
    if (path.startsWith("/"))
      return `/api${path}`;
    if (path.startsWith("http"))
      return path;
    return defaultAvatar;
  };

  const UserName = () => {
    try {
      const t = getToken();
      if (!t) return "Guest";
      const p = decodeTokenPayload(t);
      return p?.name || p?.email || "Guest";
    } catch (e) {
      return "Guest";
    }
  };

  const TokenAvatar = () => {
    if (isLoadingProfile) {
      return (
        <div className="w-[150px] h-[150px] rounded-full bg-white/10 animate-pulse" />
      );
    }
    return (
      <img
        className="w-[150px] h-[150px] object-cover rounded-full"
        alt="User Avatar"
        src={getAvatarUrl(userAvatar)}
        onError={(e: any) => {
          // Fallback to local asset if remote image fails
          e.currentTarget.src = Avatar;
        }}
      />
    );
  };

  return (
    <div className="bg-theme-bg-primary overflow-hidden w-full min-h-screen relative flex flex-col lg:flex-row">
      {/* Background decorative elements */}
      <TopRightBlurEffect />
      <div className="absolute top-[991px] left-[-285px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] blur-[153px] pointer-events-none" />

      <img
        className="absolute top-[-338px] left-[1235px] max-w-full w-[900px] pointer-events-none"
        alt="Ellipse"
        src="/ellipse-2.svg"
      />

      <div className="absolute top-[721px] left-[-512px] w-[700px] h-[700px] bg-[#dda15e80] rounded-[350px] blur-[153px] pointer-events-none" />

      {/* Left Sidebar */}
      <aside className="w-full lg:w-[450px] border-r-[1px] border-[#F9F9F9] border-opacity-[0.05] min-h-screen flex flex-col relative z-10">
        {/* Logo */}
        <div className="pt-6 md:pt-[47px] pl-4 md:pl-[43px] pb-8 md:pb-[80px] flex items-center gap-3">
          <img className="w-[150px] md:w-[200px] lg:w-[250px]" alt="Group" src={Logo} />
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col items-center px-4 md:px-[43px] mb-8 md:mb-[57px]">
          <TokenAvatar />
          {/* <div className="mt-[32px] [font-family:'Questrial',Helvetica] font-normal text-white text-[32px] tracking-[0] leading-[15px] whitespace-nowrap">
            <UserName />
          </div> */}
          {/* <div className="mt-[17px] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-base tracking-[0] leading-[15px] whitespace-nowrap cursor-pointer">
            View Profile
          </div> */}
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-3 md:gap-[18px] px-4 md:px-12 lg:px-[88px] relative">
          {navigationItems.map((item, index) => (
            <div
              key={index}
              className="cursor-pointer flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 w-full max-w-full transition-colors duration-150">
              <div
                className={`${item.active
                  ? "bg-transparent border border-white/10 border-solid rounded-full p-2 md:p-3"
                  : "bg-transparent border border-white/10 border-solid rounded-full p-2 md:p-3"
                  }`}>
                <img
                  src={item.icon}
                  alt={`${item.label} icon`}
                  className={`${item.active
                    ? "w-3 md:w-[15px] opacity-100"
                    : "w-3 md:w-[15px] text-red-500 opacity-30"
                    }`}
                />
              </div>
              <Link to={item.path}>
                <span
                  className={`[font-family:'Questrial',Helvetica] font-normal text-sm md:text-base tracking-[0] leading-[15px] whitespace-nowrap ${item.active ? "text-white" : "text-white/30"
                    }`}>
                  {item.label}
                </span>
              </Link>
            </div>
          ))}
        </nav>

        {/* logout btn */}
        <div className="mt-8 md:mt-[60px] p-2 w-full md:w-[150px] mx-4 md:mx-12 lg:ml-[88px] bg-transparent border border-solid border-[#f9f9f94c] rounded-[14px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors duration-150">
          <div>
            <img src={LogOutIcon} alt="logout icon" className="w-4 h-4" />
          </div>
          <div>
            <button
              onClick={async () => {
                try {
                  const token = getToken();

                  const res = await fetch(API_CONFIG.AUTH.LOGOUT, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                      ...(token && { Authorization: `Bearer ${token}` }),
                    },
                  });

                  if (!res.ok) {
                    console.error("[Logout] Request failed:", res.status);
                  }
                } catch (e) {
                  console.error("[Logout] Network error:", e);
                } finally {
                  clearToken();
                  redirect("/login");
                }
              }}
              className="text-light ">
              LogOut
            </button>
          </div>
        </div>

        {/* LogOutIcon Button */}
        <div className="mt-auto mb-[85px] px-[65px]">
          {/* <Button
            variant="outline"
            className="w-40 h-[43px] rounded-[14px] border border-solid border-[#f9f9f94c] bg-transparent hover:bg-transparent flex items-center justify-center gap-2">
            <LogOutIcon className="w-3 h-4" />
            <span className="[font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-base tracking-[0] leading-[15px]">
              LogOutIcon
            </span>
          </Button> */}
        </div>

        {/* Sidebar separator line */}
        {/* <img
          className="absolute top-0 right-0 w-px h-full object-cover"
          alt="Line"
          src="/line-13.svg"
        /> */}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative px-4 md:px-12 lg:px-[100px] py-6 md:py-12 lg:py-[50px]">
        <WelcomeHeaderSection />
        <PongrushGameShowcaseSection />
        {/* <StatsSection /> */}
        <DashboardSection />
      </main>
    </div>
  );
};

export default Dashboard;
