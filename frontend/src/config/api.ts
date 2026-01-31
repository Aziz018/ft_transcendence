const getBaseUrls = () => {
  if (typeof window === 'undefined') {
    return {
      API_URL: "http://localhost:3000",
      WS_URL: "ws://localhost:3000/v1/chat/ws"
    };
  }

  const hostname = window.location.hostname;
  // Use http/ws for local/IP, https/wss if serving securely
  const protocol = window.location.protocol;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const port = window.location.port;

  // If accessed via standard ports (80/443 via Nginx), use /api prefix
  // If accessed via 5173, we might want to fallback to 3000, but we closed it.
  // We assume access via Nginx.

  const API_URL = `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
  const WS_URL = `${wsProtocol}//${hostname}${port ? ':' + port : ''}/api/v1/chat/ws`;

  return { API_URL, WS_URL };
};

const { API_URL, WS_URL } = getBaseUrls();

export const API_CONFIG = {
  BASE_URL: API_URL,
  WS_URL: WS_URL,

  // API Endpoints
  AUTH: {
    LOGIN: `${API_URL}/v1/user/login`,
    REGISTER: `${API_URL}/v1/user/register`,
    LOGOUT: `${API_URL}/v1/auth/logout`,
    REFRESH: `${API_URL}/v1/user/refresh`,
    VERIFY_2FA: `${API_URL}/v1/totp/verify`,
  },

  GAME: {
    HISTORY: (uid: string) => `${API_URL}/v1/game/history/${uid}`,
    SAVE: `${API_URL}/v1/game/save`,
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


  MESSAGE: {
    SEND: `${API_URL}/v1/message/send`,
    GET: `${API_URL}/v1/message/get`,
  },
};

export default API_CONFIG;
