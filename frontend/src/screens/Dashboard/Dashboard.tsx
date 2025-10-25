import Fuego from "../../index";
import Logo from "../../assets/secondLogo.svg";
import Avatar from "../../assets/Ellipse 46.svg";
import DashboardIcon from "../../assets/dd.svg";
import LeaderboardIcon from "../../assets/Leaderboard.svg";
import Game from "../../assets/game-icon.svg";
import ChatIcon from "../../assets/chat-icon.svg";
import TournamentIcon from "../../assets/Tournament-icon.svg";
import SettingsIcon from "../../assets/Settings.svg";
import LogOutIcon from "../../assets/Logout.svg";
import WelcomeHeaderSection from "./sections/WelcomeHeaderSection";
import PingPongShowcaseSection from "./sections/PingPongShowcaseSection";
import StatsSection from "./sections/StatsSection";
import DashboardSection from "./sections/DashboardSection";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import { getToken, decodeTokenPayload, clearToken } from "../../lib/auth";
import { Link, redirect } from "../../library/Router/Router";
import { useEffect } from "../../library/hooks/useEffect";
// import { Button } from "../../components/ui/button";

const navigationItems = [
  { label: "Dashboard", active: false, icon: DashboardIcon },
  { label: "Game", active: false, icon: Game },
  { label: "Chat", active: false, icon: ChatIcon },
  { label: "Tournament", active: false, icon: TournamentIcon },
  { label: "Leaderboard", active: false, icon: LeaderboardIcon },
  { label: "Settings", active: false, icon: SettingsIcon },
];

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = Fuego.useState(true);
  const [userAvatar, setUserAvatar] = Fuego.useState("");

  // Check if user is authenticated and fetch profile
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      redirect("/");
    } else {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3001";
      const token = getToken();

      const res = await fetch(`${backend}/v1/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserAvatar(data.avatar || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  // Only show content if authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getAvatarUrl = (path: string | null | undefined): string => {
    const backend =
      (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3001";
    if (!path || !path.trim()) return `${backend}/images/default-avatar.png`;
    if (path.startsWith("/public/"))
      return `${backend}${path.replace("/public", "")}`;
    if (path.startsWith("/")) return `${backend}${path}`;
    if (path.startsWith("http")) return path;
    return `${backend}/images/default-avatar.png`;
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
    return (
      <img
        className="w-[150px] object-cover rounded-full"
        alt="User Avatar"
        src={getAvatarUrl(userAvatar)}
        onError={(e: any) => {
          const backend =
            (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
            "http://localhost:3001";
          e.currentTarget.src = `${backend}/images/default-avatar.png`;
        }}
      />
    );
  };

  return (
    <div className="bg-[#141517] overflow-hidden w-full min-w-[1431px] min-h-[1024px] relative flex">
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
      <aside className="w-[450px] border-r-[1px] border-[#F9F9F9] border-opacity-[0.05] h-screen flex flex-col relative z-10">
        {/* Logo */}
        <div className="pt-[47px] pl-[43px] pb-[80px] flex items-center gap-3">
          <img className="w-[250px] " alt="Group" src={Logo} />
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col items-center px -[43px] mb-[57px]">
          <TokenAvatar />
          {/* <div className="mt-[32px] [font-family:'Questrial',Helvetica] font-normal text-white text-[32px] tracking-[0] leading-[15px] whitespace-nowrap">
            <UserName />
          </div> */}
          <div className="mt-[17px] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-base tracking-[0] leading-[15px] whitespace-nowrap cursor-pointer">
            View Profile
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-[18px] px-[88px] relative">
          {navigationItems.map((item, index) => (
            <div
              key={index}
              className="cursor-pointer flex items-center gap-3 px -3 py -2 w-full max-w-full transition-colors duration-150">
              <div
                className={`${
                  item.active
                    ? "bg-transparent border border-white/10 border-solid rounded-full p-3"
                    : "bg-transparent border border-white/10 border-solid rounded-full p-3"
                }`}>
                <img
                  src={item.icon}
                  alt={`${item.label} icon`}
                  className={`${
                    item.active
                      ? "w-[15px] opacity-100"
                      : "w-[15px] text-red-500 opacity-30"
                  }`}
                />
              </div>
              <Link to={item.label.toLowerCase()}>
                <span
                  className={`[font-family:'Questrial',Helvetica] font-normal text-base tracking-[0] leading-[15px] whitespace-nowrap ${
                    item.active ? "text-white" : "text-white/30"
                  }`}>
                  {item.label}
                </span>
              </Link>
            </div>
          ))}
        </nav>

        {/* logout btn */}
        <div className="mt-[60px] p-2 w-[150px] bg-transparent ml-[88px] border border-solid border-[#f9f9f94c] rounded-[14px] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors duration-150">
          <div>
            <img src={LogOutIcon} alt="logout icon" className="w-4 h-4" />
          </div>
          <div>
            <button
              onClick={async () => {
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
                  console.warn("logout request failed", e);
                }

                clearToken();
                redirect("/");
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
      <main className="flex-1 relative px-[100px] py-[50px]">
        <WelcomeHeaderSection />
        <PingPongShowcaseSection />
        {/* <StatsSection /> */}
        <DashboardSection />
      </main>
    </div>
  );
};

export default Dashboard;
