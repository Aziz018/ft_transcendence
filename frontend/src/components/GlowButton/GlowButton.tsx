/**
 * GLOW BUTTON - Premium Gaming Button Component
 * With hover glow effects and smooth animations
 */

import React, { useState } from "react";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES = {
  primary: {
    bg: "bg-cyan-500 hover:bg-cyan-600",
    glow: "hover:shadow-glow-cyan hover:shadow-glow-cyan-lg",
    text: "text-dark-950",
    border: "border-cyan-500",
  },
  secondary: {
    bg: "bg-purple-500 hover:bg-purple-600",
    glow: "hover:shadow-glow-purple hover:shadow-glow-purple-lg",
    text: "text-white",
    border: "border-purple-500",
  },
  tertiary: {
    bg: "bg-lime-500 hover:bg-lime-600",
    glow: "hover:shadow-glow-lime hover:shadow-glow-lime-lg",
    text: "text-dark-950",
    border: "border-lime-500",
  },
  danger: {
    bg: "bg-red-600 hover:bg-red-700",
    glow: "hover:shadow-lg",
    text: "text-white",
    border: "border-red-600",
  },
};

const SIZE_STYLES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  loading = false,
  fullWidth = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const styles = VARIANT_STYLES[variant];
  const sizeClasses = SIZE_STYLES[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-lg font-mono font-semibold
        transition-all duration-300 ease-out
        border border-opacity-30 ${styles.border}
        ${styles.bg}
        ${styles.text}
        ${styles.glow}
        ${sizeClasses}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="inline-block mr-2 animate-rotate">⊙</span>
      )}

      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Glow background (animated on hover) */}
      {isHovered && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(circle at center, ${
              variant === "primary"
                ? "rgba(0, 240, 255, 0.2)"
                : variant === "secondary"
                  ? "rgba(170, 0, 255, 0.2)"
                  : "rgba(57, 255, 20, 0.2)"
            }, transparent)`,
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}
    </button>
  );
};

export default GlowButton;
