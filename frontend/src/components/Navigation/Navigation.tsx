import React from "react";
import SearchInput from "./SearchInput";
import UserProfile from "./UserProfile";
import { Bell, Mail } from "lucide-react";

interface NavigationProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onMessageClick?: () => void;
  notificationCount?: number;
  messageCount?: number;
}

const Navigation: React.FC<NavigationProps> = ({
  userName = "Totok Michael",
  userEmail = "tmichael@gmail.com",
  userAvatar = "https://via.placeholder.com/40",
  onSearch,
  onNotificationClick,
  onMessageClick,
  notificationCount = 0,
  messageCount = 0,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-50 border-b border-gray-200 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section: Search */}
        <div className="flex-1 max-w-md">
          <SearchInput onSearch={onSearch} />
        </div>

        {/* Center Section: Icon Buttons */}
        <div className="flex items-center gap-4 mx-6">
          {/* Notifications Button */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.5} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Messages Button */}
          <button
            onClick={onMessageClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Messages"
          >
            <Mail size={20} strokeWidth={1.5} />
            {messageCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Right Section: User Profile */}
        <div>
          <UserProfile
            name={userName}
            email={userEmail}
            avatar={userAvatar}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
