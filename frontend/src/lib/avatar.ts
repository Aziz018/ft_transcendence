/**
 * Centralized avatar utility
 * Provides a single default avatar and consistent avatar URL handling across the application
 */

import { API_CONFIG } from "../config/api";

/**
 * Single source of truth for default avatar
 * Using ui-avatars.com for consistency with existing Dashboard/Settings
 */
export const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=FF6B35&color=fff&size=128";

/**
 * Get proper avatar URL - handles both backend URLs and external URLs
 * @param avatarPath - The avatar path from the backend (can be null/undefined)
 * @returns The full URL to the avatar image
 */
export const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  // No path provided - return default
  if (!avatarPath || !avatarPath.trim()) {
    return DEFAULT_AVATAR;
  }

  // Handle /public/ prefix (legacy backend format)
  if (avatarPath.startsWith("/public/")) {
    return `${API_CONFIG.BASE_URL}${avatarPath.replace("/public", "")}`;
  }

  // Handle absolute paths starting with /
  if (avatarPath.startsWith("/")) {
    return `${API_CONFIG.BASE_URL}${avatarPath}`;
  }

  // Handle full HTTP/HTTPS URLs (OAuth providers, external services)
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  // Fallback to default if path format is unexpected
  return DEFAULT_AVATAR;
};
