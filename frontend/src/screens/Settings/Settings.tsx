import Fuego from "../../index";
import { useState } from "../../library/hooks/useState";
import { useEffect } from "../../library/hooks/useEffect";
import { Link, redirect } from "../../library/Router/Router";
import { getToken, clearToken, decodeTokenPayload } from "../../lib/auth";
import { wsService } from "../../services/wsService";
import TopRightBlurEffect from "../../components/ui/BlurEffect/TopRightBlurEffect";
import { fetchWithAuth } from "../../lib/fetch";
import { API_CONFIG } from "../../config/api";
import QRCode from "qrcode";

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
  { label: "Career", active: false, icon: LeaderboardIcon, path: "career" },
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
  const [otpCode, setOtpCode] = useState(""); // State for OTP input
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = Fuego.useRef<HTMLInputElement>(null);

  // Store original values to revert on cancel
  const [originalUserName, setOriginalUserName] = useState("");
  const [originalUserEmail, setOriginalUserEmail] = useState("");

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
      fetchUserProfile();
      check2FAStatus();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetchWithAuth(API_CONFIG.USER.PROFILE);

      if (res.ok) {
        const data = await res.json();
        setUserName(data.name || "");
        setUserEmail(data.email || "");
        setOriginalUserName(data.name || "");
        setOriginalUserEmail(data.email || "");
        setUserAvatar(data.avatar || "");
        setUserAvatar(data.avatar || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const check2FAStatus = async () => {
    try {
      const res = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/totp/status`);

      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.status);
      } else {
        console.error("Failed check 2FA status");
        setTwoFactorEnabled(false);
      }
    } catch (error) {
      console.error("Failed to check 2FA status:", error);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleStartEdit = () => {
    setOriginalUserName(userName);
    setOriginalUserEmail(userEmail);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setUserName(originalUserName);
    setUserEmail(originalUserEmail);
    setIsEditing(false);

    // Force re-render by re-fetching if state update is batched/delayed
    // This is a fallback for the custom framework's state handling
    setTimeout(() => {
      const nameInput = document.querySelector('input[type="text"][value]') as HTMLInputElement;
      const emailInput = document.querySelector('input[type="email"][value]') as HTMLInputElement;
      if (nameInput) nameInput.value = originalUserName;
      if (emailInput) emailInput.value = originalUserEmail;
    }, 0);
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!userName.trim()) {
      alert("Username cannot be empty");
      return;
    }

    if (!userEmail.trim()) {
      alert("Email cannot be empty");
      return;
    }

    if (!validateEmail(userEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      // Update Name
      const nameRes = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: "name",
          value: userName.trim(),
        }),
      });

      if (!nameRes.ok) {
        const error = await nameRes.json();
        throw new Error(error.message || "Failed to update name");
      }

      // Update Email (if changed)
      // Update Email (if changed)
      const emailRes = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: "email",
          value: userEmail.trim(),
        }),
      });

      if (!emailRes.ok) {
        const error = await emailRes.json();
        throw new Error(error.message || "Failed to update email");
      }

      setIsEditing(false);
      await fetchUserProfile();
      alert("Profile updated successfully");

    } catch (error: any) {
      console.error("Failed to update profile:", error);
      alert(error.message || "Failed to update profile. Please try again.");
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
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/user/avatar`, {
        method: "POST",
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

  const handleActivate2FA = async () => {
    if (twoFactorEnabled) {
      // Handle disable logic
      const confirmed = confirm("Are you sure you want to disable 2FA?");
      if (!confirmed) return;

      try {
        const res = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/totp/disable`, {
          method: "PUT",
        });

        if (res.ok) {
          setTwoFactorEnabled(false);
          alert("Two-Factor Authentication disabled successfully.");
        } else {
          alert("Failed to disable 2FA.");
        }
      } catch (error) {
        console.error("Error disabling 2FA:", error);
      }
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/totp/qr-code`);

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          const qrCodeDataUrl = await QRCode.toDataURL(data.url);
          setQrCode(qrCodeDataUrl);
          setOtpCode(""); // Reset OTP code
          setShowTwoFactorModal(true);
        }
      } else {
        console.error("Failed to fetch QR code");
        alert("Failed to generate QR code. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      alert("Error fetching QR code. Please try again.");
    }
  };

  const handleVerify2FA = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_CONFIG.BASE_URL}/v1/totp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mfa_code: otpCode })
      });

      if (res.ok) {
        setTwoFactorEnabled(true);
        setShowTwoFactorModal(false);
        alert("Two-Factor Authentication activated successfully! You will be logged out.");
        await handleLogout();
      } else {
        const data = await res.json();
        alert(data.message || "Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      alert("Error verifying code. Please check your connection.");
    }
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
                  className={`${item.active
                    ? "bg-accent-green/20 border border-accent-green/50"
                    : "bg-transparent border border-white/10"
                    } rounded-full p-3 transition-all duration-150`}>
                  <img
                    src={item.icon}
                    alt={`${item.label} icon`}
                    className={`w-[15px] ${item.active ? "opacity-100" : "opacity-30"
                      } transition-opacity duration-150`}
                  />
                </div>
                <span
                  className={`font-questrial font-normal text-base tracking-[0] leading-[15px] whitespace-nowrap ${item.active ? "text-light" : "text-light/30"
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
                    onClick={handleStartEdit}
                    className="px-4 py-2 bg-accent-green text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-green/90 transition-colors">
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
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
                  className={`px-6 py-3 rounded-lg font-questrial font-semibold transition-colors ${twoFactorEnabled
                    ? "bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30"
                    : "bg-accent-orange text-dark-950 hover:bg-accent-orange/90"
                    }`}>
                  {twoFactorEnabled ? "Disable 2FA" : "Activate 2FA"}
                </button>
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
              {qrCode ? (
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Loading...</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="font-questrial text-light/60 text-sm mb-2 text-center">
                Enter the 6-digit code from your app
              </p>
              <input
                type="text"
                value={otpCode}
                onChange={(e: any) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-light font-questrial text-center tracking-[0.5em] text-xl focus:outline-none focus:border-accent-green"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-light rounded-lg font-questrial hover:bg-white/20 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleVerify2FA}
                className="flex-1 px-4 py-3 bg-accent-orange text-dark-950 rounded-lg font-questrial font-semibold hover:bg-accent-orange/90 transition-colors">
                Verify & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
