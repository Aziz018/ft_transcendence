
import React from "react";
interface UserProfileProps {
  name?: string;
  email?: string;
  avatar?: string;
  onClick?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  name = "User",
  email = "user@example.com",
  avatar = "https://via.placeholder.com/40",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {/* Avatar */}
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
      />

      {/* User Info */}
      <div className="flex flex-col items-start">
        <div className="text-sm font-semibold text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">{email}</div>
      </div>
    </button>
  );
};

export default UserProfile;
