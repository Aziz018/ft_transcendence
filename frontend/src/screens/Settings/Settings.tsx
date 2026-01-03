import Fuego from "../../index";
import { useState } from "../../library/hooks/useState";
import { useEffect } from "../../library/hooks/useEffect";
import { Link, redirect } from "../../library/Router/Router";
import { getToken, clearToken } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import { useTheme, themeService } from "../../context/ThemeContext";

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
    active: false,
    icon: LeaderboardIcon,
    path: "leaderboard",
  },
  { label: "Settings", active: true, icon: SettingsIcon, path: "settings" },
];

const Settings = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const theme = useTheme();
  const isDarkMode = theme === "dark";
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = Fuego.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      redirect("/");
    } else {
      wsService.connect();
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
        setUserName(data.name || "");
        setUserEmail(data.email || "");
        setUserAvatar(data.avatar || "");
        setTwoFactorEnabled(data.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3001";
      const token = getToken();

      const nameRes = await fetch(`${backend}/v1/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: "name",
          value: userName,
        }),
      });

      if (nameRes.ok) {
        setIsEditing(false);
        await fetchUserProfile();
      } else {
        const error = await nameRes.json();
        console.error("Failed to update profile:", error);
        alert(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3001";
      const token = getToken();

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${backend}/v1/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUserAvatar(data.avatar || data.avatarUrl || "");
        await fetchUserProfile();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleActivate2FA = async () => {
    setShowTwoFactorModal(true);
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
        <div className="w-full max-w-layout mx-auto px-layout py-12">
          <div className="mb-12">
            <h1 className="font-questrial font-normal text-light text-4xl mb-2">
              Account Settings
            </h1>
            <p className="font-questrial text-light/60 text-base">
              Manage your profile and security preferences
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-questrial text-light text-2xl">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-accent-green text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-green/90 transition-colors">
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/10 text-light rounded-lg font-questrial hover:bg-white/20 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-accent-green text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-green/90 transition-colors">
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 relative group">
                  <img
                    src={getAvatarUrl(userAvatar)}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-accent-green/50"
                  />
                  {isEditing && (
                    <div
                      onClick={handleAvatarClick}
                      className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="text-center">
                        {isUploadingAvatar ? (
                          <div className="w-6 h-6 border-2 border-light border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          <>
                            <svg
                              className="w-6 h-6 text-light mx-auto mb-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-xs text-light font-questrial">
                              Change
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-light/60 text-sm font-questrial mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e: any) => setUserName(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-light font-questrial focus:outline-none focus:border-accent-green disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-light/60 text-sm font-questrial mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e: any) => setUserEmail(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-light font-questrial focus:outline-none focus:border-accent-green disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="font-questrial text-light text-2xl mb-4">
                Security
              </h2>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="font-questrial text-light text-lg mb-1">
                    Two-Factor Authentication
                  </h3>
                  <p className="font-questrial text-light/60 text-sm">
                    Add an extra layer of security to your account
                  </p>
                </div>

                <button
                  onClick={handleActivate2FA}
                  className={`px-6 py-3 rounded-lg font-questrial font-semibold transition-colors ${
                    twoFactorEnabled
                      ? "bg-white/10 text-light hover:bg-white/20"
                      : "bg-accent-orange text-dark-950 hover:bg-accent-orange/90"
                  }`}>
                  {twoFactorEnabled ? "Enabled" : "Activate 2FA"}
                </button>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="font-questrial text-light text-2xl mb-4">
                Preferences
              </h2>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="font-questrial text-light text-lg mb-1">
                    Theme
                  </h3>
                  <p className="font-questrial text-light/60 text-sm">
                    Choose your preferred color scheme
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-questrial text-sm ${
                      !isDarkMode ? "text-light" : "text-light/40"
                    }`}>
                    Light
                  </span>
                  <button
                    onClick={() => themeService.toggleTheme()}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      isDarkMode ? "bg-accent-green" : "bg-white/20"
                    }`}>
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        isDarkMode ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`font-questrial text-sm ${
                      isDarkMode ? "text-light" : "text-light/40"
                    }`}>
                    Dark
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="font-questrial text-light text-2xl mb-4">
              Activate Two-Factor Authentication
            </h2>
            <p className="font-questrial text-light/60 mb-6">
              Scan this QR code with your authenticator app
            </p>

            <div className="bg-white p-4 rounded-lg mb-6 flex items-center justify-center">
              <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  QR Code Placeholder
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-light rounded-lg font-questrial hover:bg-white/20 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  setTwoFactorEnabled(true);
                  setShowTwoFactorModal(false);
                }}
                className="flex-1 px-4 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
