/**
 * PREMIUM CARD COMPONENT
 * Futuristic gaming aesthetic with glow effects and animations
 */

import React from "react";
import { motion } from "framer-motion";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "lime";
  hover?: boolean;
  animated?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = "",
  glowColor = "cyan",
  hover = true,
  animated = true,
  gradient = false,
  onClick,
}) => {
  const glowVariants = {
    cyan: "shadow-glow-cyan hover:shadow-glow-cyan-lg",
    purple: "shadow-glow-purple hover:shadow-glow-purple-lg",
    lime: "shadow-glow-lime hover:shadow-glow-lime-lg",
  };

  const borderVariants = {
    cyan: "border-cyan-500",
    purple: "border-purple-500",
    lime: "border-lime-500",
  };

  const gradientBg = gradient
    ? "bg-gradient-card backdrop-blur-lg"
    : "bg-dark-900 backdrop-blur-lg";

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={animated ? { duration: 0.3 } : undefined}
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      className={`
        relative rounded-xl border border-opacity-30
        transition-all duration-300 ease-out
        ${gradientBg}
        ${borderVariants[glowColor]}
        ${hover ? glowVariants[glowColor] : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

interface PremiumCardHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PremiumCardHeader: React.FC<PremiumCardHeaderProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = "",
}) => {
  return (
    <div className={`flex items-start gap-3 mb-4 ${className}`}>
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="text-2xl"
        >
          {icon}
        </motion.div>
      )}
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-white font-display">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-text-secondary font-mono">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};

interface PremiumCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const PremiumCardBody: React.FC<PremiumCardBodyProps> = ({
  children,
  className = "",
}) => {
  return <div className={`text-text-primary text-sm leading-relaxed ${className}`}>{children}</div>;
};

interface PremiumCardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right" | "between";
}

export const PremiumCardFooter: React.FC<PremiumCardFooterProps> = ({
  children,
  className = "",
  align = "between",
}) => {
  const alignVariants = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={`
        flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle
        ${alignVariants[align]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default PremiumCard;
