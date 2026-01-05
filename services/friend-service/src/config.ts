import process from 'process';

export const CONFIG = {
  MESSAGE: {
    MAX_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH || '2000'),
    EDIT_WINDOW_HOURS: parseInt(process.env.MESSAGE_EDIT_WINDOW_HOURS || '24'),
  },
  ROOM: {
    MAX_NAME_LENGTH: parseInt(process.env.MAX_ROOM_NAME_LENGTH || '100'),
  },
  RATE_LIMITS: {
    DELETED_MESSAGES_PER_MINUTE: parseInt(
      process.env.RATE_LIMIT_DELETE_MESSAGES || '5'
    ),
    ROOM_KICKS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_ROOM_KICKS || '2'),
    ADMIN_ACTIONS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_ADMIN || '3'),
    MESSAGES_PER_MINUTE: parseInt(process.env.RATE_LIMIT_MESSAGES || '10'),
    TYPING_PER_10_SECONDS: parseInt(process.env.RATE_LIMIT_TYPING || '5'),
    EDITS_PER_10_SECONDS: parseInt(process.env.RATE_LIMIT_EDITS || '5'),
    PROMOTE_MEMBER: parseInt(process.env.RATE_LIMIT_PROMOTE || '5'),
  },
  CLEANUP: {
    CLIENT_OFFSETS_MAX: parseInt(process.env.MAX_CLIENT_OFFSETS || '1000'),
    CLIENT_OFFSETS_MAX_AGE_MINUTES: parseInt(
      process.env.CLIENT_OFFSETS_MAX_AGE || '30'
    ),
    CLEANUP_INTERVAL_MINUTES: parseInt(process.env.CLEANUP_INTERVAL || '2'),
  },
} as const;

export default CONFIG;
