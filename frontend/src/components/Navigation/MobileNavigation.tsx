import React, { useState } from "react";
import { Link } from "../../router";
import Logo from "../../assets/secondLogo.svg";

interface NavigationItem {
  label: string;
  active: boolean;
  icon: string;
  path: string;
}

interface MobileNavigationProps {
  navigationItems: NavigationItem[];
  userAvatar: React.ReactNode;
  onLogout: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  navigationItems,
  userAvatar,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile/Tablet Hamburger Icon - Only visible on mobile/tablet */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed top-6 left-4 z-50 w-11 h-11 flex flex-col items-center justify-center gap-1.5 bg-transparent border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <span
          className={`w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Overlay - Click to close menu */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Slide-out Navigation Menu */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-theme-bg-primary border-r border-white/5 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="pt-12 pl-6 pb-8 flex items-center">
          <img className="w-[180px]" alt="PongRush Logo" src={Logo} />
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col items-center px-6 mb-8">
          {userAvatar}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-3 px-6 mb-8">
          {navigationItems.map((item, index) => (
            <Link key={index} to={item.path} onClick={closeMenu}>
              <div className="cursor-pointer flex items-center gap-3 px-3 py-3 w-full rounded-lg transition-all duration-150 hover:bg-white/5 active:bg-white/10">
                <div
                  className={`${
                    item.active
                      ? "bg-white/10 border border-white/20"
                      : "bg-transparent border border-white/10"
                  } rounded-full p-3 transition-all duration-150`}
                >
                  <img
                    src={item.icon}
                    alt={`${item.label} icon`}
                    className={`w-4 h-4 ${
                      item.active ? "opacity-100" : "opacity-30"
                    }`}
                  />
                </div>
                <span
                  className={`font-questrial font-normal text-base tracking-[0] leading-[15px] ${
                    item.active ? "text-white" : "text-white/30"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-6 pb-8">
          <button
            onClick={() => {
              closeMenu();
              onLogout();
            }}
            className="w-full min-h-[44px] p-3 bg-transparent border border-white/10 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 active:bg-white/10 transition-all duration-150"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.6667 11.3333L14 8L10.6667 4.66667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 8H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-white font-questrial text-base">LogOut</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileNavigation;
