#!/bin/bash

echo "🧪 Cross-Service Database Integration Tests"
echo "============================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: User data synchronization simulation
echo -e "${BLUE}Test 1: User Data Sync Simulation${NC}"
echo "-----------------------------------"
cat << 'EOF'
# Simulate creating a user in user-service, then syncing to game-service

# 1. User registers in user-service (POST /api/users/register)
USER_ID="550e8400-e29b-41d4-a716-446655440000"
USER_DATA='{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "TestPlayer",
  "email": "test@example.com",
  "xp": 0
}'

# 2. When user starts a game, game-service creates/updates local User record
# This happens automatically when authenticating via JWT token

# 3. Test the flow:
echo "Creating user in game-service database..."
npx prisma db execute --stdin <<SQL
INSERT OR IGNORE INTO User (id, name, email, xp, createdAt, updatedAt)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'TestPlayer',
  'test@example.com',
  0,
  datetime('now'),
  datetime('now')
);
SQL
EOF
echo ""

# Test 2: Database schema introspection
echo -e "${BLUE}Test 2: Schema Introspection${NC}"
echo "-----------------------------"
echo "Command: npx prisma db pull --force"
echo "  → Syncs Prisma schema with actual database"
echo ""
echo "Command: npx prisma format"
echo "  → Formats schema.prisma file"
echo ""

# Test 3: Migration workflow
echo -e "${BLUE}Test 3: Database Migration Commands${NC}"
echo "------------------------------------"
cat << 'EOF'
# Development workflow (SQLite with db push):
npx prisma db push --accept-data-loss
  → Pushes schema changes to database
  → No migration files needed
  → Good for rapid development

# Production workflow (PostgreSQL with migrations):
npx prisma migrate dev --name add_game_stats
  → Creates migration files
  → Applies to database
  → Version controlled

# Check migration status:
npx prisma migrate status
  → Shows pending migrations

# Deploy migrations in production:
npx prisma migrate deploy
  → Applies pending migrations
EOF
echo ""

# Test 4: Cross-service query examples
echo -e "${BLUE}Test 4: Cross-Service Query Patterns${NC}"
echo "--------------------------------------"
cat << 'EOF'
# Game service queries own database for game data:
const gameSession = await prisma.gameSession.findUnique({
  where: { id: sessionId },
  include: {
    player1: true,  // Local user cache
    player2: true
  }
});

# For full user details, call user-service API:
const fullUserData = await fetch(
  `${USER_SERVICE_URL}/api/users/${userId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

# Update local user cache when needed:
await prisma.user.upsert({
  where: { id: userId },
  update: { name, email, xp },
  create: { id: userId, name, email, xp }
});
EOF
echo ""

# Test 5: Database connectivity tests
echo -e "${BLUE}Test 5: Database Connection Tests${NC}"
echo "----------------------------------"
cat << 'EOF'
# Test 1: Check database exists and is accessible
npx prisma db execute --stdin <<SQL
SELECT 1;
SQL

# Test 2: Count users in game-service database
npx prisma db execute --stdin <<SQL
SELECT COUNT(*) as user_count FROM User;
SQL

# Test 3: List all tables
npx prisma db execute --stdin <<SQL
SELECT name FROM sqlite_master
WHERE type='table'
ORDER BY name;
SQL

# Test 4: Show User table structure
npx prisma db execute --stdin <<SQL
PRAGMA table_info(User);
SQL

# Test 5: Show all indexes
npx prisma db execute --stdin <<SQL
SELECT name, tbl_name, sql
FROM sqlite_master
WHERE type='index'
AND tbl_name='GameSession';
SQL
EOF
echo ""

# Test 6: JWT token-based user sync test
echo -e "${BLUE}Test 6: JWT User Sync Flow${NC}"
echo "---------------------------"
cat << 'EOF'
# When a user connects to game-service WebSocket:

1. Extract JWT token from request
   const token = extractTokenFromRequest(request);

2. Verify token with JWT_SECRET
   const decoded = jwt.verify(token);
   // decoded = { uid, id, name, email }

3. Ensure user exists in local game database
   await prisma.user.upsert({
     where: { id: decoded.uid },
     update: {
       name: decoded.name,
       email: decoded.email
     },
     create: {
       id: decoded.uid,
       name: decoded.name,
       email: decoded.email,
       xp: 0
     }
   });

4. User is now ready for game operations
   const gameSession = await gameService.createSession({
     player1Id: decoded.uid,
     type: 'RANKED'
   });
EOF
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}📋 Quick Command Reference${NC}"
echo "=============================================="
echo ""
echo "Database Setup:"
echo "  npx prisma generate          # Generate Prisma client"
echo "  npx prisma db push           # Sync schema to database"
echo ""
echo "Database Queries:"
echo "  npx prisma studio            # Open database GUI"
echo "  npx prisma db seed           # Run seed data"
echo ""
echo "Schema Management:"
echo "  npx prisma validate          # Validate schema"
echo "  npx prisma format            # Format schema file"
echo "  npx prisma db pull           # Introspect database"
echo ""
echo "Testing in Docker:"
echo "  docker exec -it ft_game_service sh"
echo "  cd /usr/src/app"
echo "  npx prisma studio --browser none"
echo ""
echo -e "${GREEN}✓ All integration patterns documented!${NC}"
echo ""
