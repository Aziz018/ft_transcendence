/**
 * Centralized API Configuration
 * 
 * All API calls use a single backend origin.
 * In monolithic architecture, backend and frontend are served from same origin.
 */

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
const WS_URL = (import.meta as any).env?.VITE_WS_URL || "ws://localhost:3000/v1/chat/ws";

export const API_CONFIG = {
  BASE_URL: API_URL,
  WS_URL: WS_URL,
  GAME_WS_URL: (import.meta as any).env?.VITE_GAME_WS_URL || "ws://localhost:3000/v1/game/ws",

  // API Endpoints
  AUTH: {
    LOGIN: `${API_URL}/v1/user/login`,
    REGISTER: `${API_URL}/v1/user/register`,
    LOGOUT: `${API_URL}/v1/user/logout`,
    REFRESH: `${API_URL}/v1/user/refresh`,
    VERIFY_2FA: `${API_URL}/v1/totp/verify`,
  },

  USER: {
    PROFILE: `${API_URL}/v1/user/profile`,
    SEARCH: `${API_URL}/v1/user/search`,
    UPDATE_PROFILE: `${API_URL}/v1/user/profile`,
    UPLOAD_AVATAR: `${API_URL}/v1/user/avatar`,
    GET_USER: (id: string) => `${API_URL}/v1/user/${id}`,
  },

  CHAT: {
    WS: WS_URL,
    MESSAGES: `${API_URL}/v1/chat/messages`,
    ROOMS: `${API_URL}/v1/chat/rooms`,
  },

  FRIEND: {
    LIST: `${API_URL}/v1/friend/list`,
    ADD: `${API_URL}/v1/friend/add`,
    REMOVE: `${API_URL}/v1/friend/remove`,
    REQUESTS: `${API_URL}/v1/friend/requests`,
  },

  GAME: {
    START: `${API_URL}/v1/game/start`,
    MATCH: (id: string) => `${API_URL}/v1/game/match/${id}`,
    HISTORY: (id: string) => `${API_URL}/v1/game/history/${id}`,
  },

  MESSAGE: {
    SEND: `${API_URL}/v1/message/send`,
    GET: `${API_URL}/v1/message/get`,
  },
};

export default API_CONFIG;
