# Game Service Migration - Monolithic Architecture

## Overview
Successfully migrated the real-time Pong game service from the microservices architecture to the monolithic backend following the established patterns and coding style.

## Files Created/Modified

### 1. Database Schema
- **Modified**: `prisma/schema.prisma`
  - Added `GameType` and `GameStatus` enums
  - Added `GameSession` model for individual game sessions
  - Added `PlayerStats` model for player statistics
  - Added `GameHistory` model for leaderboard and analytics

### 2. TypeScript Models
- **Created**: `src/models/game.ts`
  - Game-related TypeScript interfaces
  - Input/output type definitions
  - Following the monolithic typing patterns

### 3. Service Layer
- **Created**: `src/services/game.ts`
  - `GameService` class extending `DataBaseWrapper`
  - Real-time game session management
  - Matchmaking queue system
  - Bot opponent AI
  - EXP-based scoring with 1-minute matches
  - Database persistence for game results and player stats

### 4. Controller Layer
- **Created**: `src/controllers/game.ts`
  - `gameWebSocketHandler` for real-time game connections
  - `getPlayerStatsController` for player statistics
  - `getRecentGamesController` for game history
  - `getGameStatsController` for service statistics

### 5. Routes
- **Created**: `src/routes/game.ts`
  - WebSocket route: `/v1/game/ws`
  - REST endpoints:
    - `GET /v1/game/stats/:userId` - Player statistics
    - `GET /v1/game/history/:userId` - Recent games
    - `GET /v1/game/service-stats` - Service statistics

### 6. Validation Schemas
- **Modified**: `src/schemas/game.ts`
  - JSON Schema definitions (Fastify native format)
  - Player move validation
  - Game join/matchmaking schemas
  - Score update and match end schemas

### 7. Service Registration
- **Modified**: `src/services/index.ts`
  - Added `GameService` import and registration
- **Modified**: `src/types/service-manager.d.ts`
  - Added `game: GameService` to ServiceManager interface
- **Modified**: `src/app.ts`
  - Registered game routes with prefix `/v1/game`

## Key Features

### Real-time Gameplay
- WebSocket-based communication
- Player movement synchronization
- Bot opponent with AI behavior
- JWT authentication for WebSocket connections

### Matchmaking System
- Automatic player matching (2-player queue)
- Bot assignment after 10 seconds wait time
- Support for classic and tournament game types

### Scoring System
- EXP-based scoring (not traditional Pong points)
- 1-minute match duration
- Real-time score updates
- Winner determination based on final EXP

### Database Persistence
- Game session history
- Player statistics (wins, losses, streaks)
- Game history for leaderboards
- Automatic stats updates after each match

### Bot AI
- Random up/down movement every 1.5 seconds
- Simulates ball tracking behavior
- Isolated to bot games (not saved to database)

## Architecture Patterns Followed

✅ **Service Layer**: Extends `DataBaseWrapper`, receives `FastifyInstance`
✅ **Controllers**: Exported named async functions with typed request/reply
✅ **Routes**: Async function accepting `(fastify, options)`
✅ **Validation**: JSON Schema (Fastify native), not Zod
✅ **Database**: Shared Prisma singleton via `this.prisma`
✅ **Error Handling**: Try/catch with proper reply codes
✅ **Imports**: ES modules with `.js` extensions
✅ **Service Manager**: Plugin-based decorator pattern

## WebSocket Message Types

### Client → Server
- `ping` - Heartbeat
- `player_move` - Paddle movement (up/down/left/right)
- `game_join` - Join existing game or matchmaking
- `matchmaking` - Join/leave matchmaking queue
- `game_ready` - Signal ready to start
- `score_update` - Real-time EXP score update
- `match_end` - Final scores when timer expires

### Server → Client
- `pong` - Heartbeat response
- `welcome` - Connection confirmation
- `game_matched` - Game found, session created
- `player_moved` - Opponent movement
- `game_start` - Match timer started
- `score_update` - Score sync
- `match_ended` - Game completed with results
- `error` - Error messages

## Next Steps

1. **Install dependencies**: Run `npm install` in backend directory
2. **Generate Prisma client**: Run `npx prisma generate`
3. **Run migrations**: Run `npx prisma migrate dev`
4. **Start server**: Run `npm run dev`

## Testing

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/v1/game/ws?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  // Join matchmaking
  ws.send(JSON.stringify({
    type: 'matchmaking',
    payload: { action: 'join', gameType: 'classic' }
  }));
};
```

### REST Endpoints
```bash
# Get player stats
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/v1/game/stats/USER_ID

# Get recent games
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/v1/game/history/USER_ID?limit=10

# Get service stats
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/v1/game/service-stats
```

## Migration Complete! 🎮

The game service is now fully integrated into the monolithic backend following all established patterns and coding conventions.
