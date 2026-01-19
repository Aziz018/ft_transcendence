/**
 * Game-related JSON Schema definitions for validation
 * Following Fastify's native JSON Schema format
 */

export const playerMoveSchema = {
  tags: ['game'],
  body: {
    type: 'object',
    required: ['direction', 'gameId', 'timestamp'],
    properties: {
      direction: {
        type: 'string',
        enum: ['up', 'down', 'left', 'right']
      },
      gameId: { type: 'string', minLength: 1 },
      timestamp: { type: 'number' }
    }
  }
};

export const gameJoinSchema = {
  tags: ['game'],
  body: {
    type: 'object',
    properties: {
      gameId: { type: 'string', minLength: 1 },
      gameType: {
        type: 'string',
        enum: ['classic', 'tournament'],
        default: 'classic'
      }
    }
  }
};

export const matchmakingSchema = {
  tags: ['game'],
  body: {
    type: 'object',
    required: ['action'],
    properties: {
      action: {
        type: 'string',
        enum: ['join', 'leave']
      },
      gameType: {
        type: 'string',
        enum: ['classic', 'tournament'],
        default: 'classic'
      }
    }
  }
};

export const gameReadySchema = {
  tags: ['game'],
  body: {
    type: 'object',
    required: ['gameId'],
    properties: {
      gameId: { type: 'string', minLength: 1 }
    }
  }
};

export const scoreUpdateSchema = {
  tags: ['game'],
  body: {
    type: 'object',
    required: ['gameId', 'playerId', 'currentExp', 'timestamp'],
    properties: {
      gameId: { type: 'string', minLength: 1 },
      playerId: { type: 'string', minLength: 1 },
      currentExp: { type: 'number', minimum: 0 },
      timestamp: { type: 'number' }
    }
  }
};

export const matchEndSchema = {
  tags: ['game'],
  body: {
    type: 'object',
    required: ['gameId', 'player1Id', 'player1Exp', 'player2Id', 'player2Exp', 'timestamp'],
    properties: {
      gameId: { type: 'string', minLength: 1 },
      player1Id: { type: 'string', minLength: 1 },
      player1Exp: { type: 'number', minimum: 0 },
      player2Id: { type: 'string', minLength: 1 },
      player2Exp: { type: 'number', minimum: 0 },
      matchDurationMs: { type: 'number', default: 60000 },
      timestamp: { type: 'number' }
    }
  }
};

export const gameResultSchema = {
  tags: ['game'],
  body: {
    type: 'object',
    required: ['gameId', 'winnerId'],
    properties: {
      gameId: { type: 'string', minLength: 1 },
      winnerId: { type: 'string', minLength: 1 },
      score: {
        type: 'object',
        properties: {
          player1: { type: 'number' },
          player2: { type: 'number' }
        }
      }
    }
  }
};
