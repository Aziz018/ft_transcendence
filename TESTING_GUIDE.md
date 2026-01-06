# 🧪 TESTING & VALIDATION GUIDE

## Quick System Test

### 1. Deploy the System
```bash
# Use monolithic for quick testing
docker-compose -f docker-compose.monolithic.yml up --build -d

# Wait for services to start (check logs)
docker-compose logs -f
```

### 2. Test Frontend Access
```bash
# Open browser
http://localhost:8080

# Expected: Login/signup page loads without errors
# Check browser console: No CORS or CORB errors
```

### 3. Test User Registration
```bash
# Via browser:
1. Go to http://localhost:8080
2. Click "Sign Up"
3. Fill in: email, username, password
4. Submit

# Expected result:
✅ No CORB errors in console
✅ Network tab shows:
   - POST /v1/user/register returns 201
   - Response has Content-Type: application/json
   - Cookie "access_token" is set
✅ Redirects to dashboard

# Via curl:
curl -X POST http://localhost:3000/v1/user/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}' \
  -v

# Expected headers in response:
# Access-Control-Allow-Origin: http://localhost:8080
# Access-Control-Allow-Credentials: true
# Content-Type: application/json; charset=utf-8
```

### 4. Test User Login
```bash
# Via browser:
1. Go to http://localhost:8080
2. Enter credentials
3. Click "Login"

# Expected result:
✅ POST /v1/user/login returns 200
✅ JWT token received
✅ Cookie set
✅ Redirects to dashboard

# Via curl:
curl -X POST http://localhost:3000/v1/user/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v

# Save the access_token from response for next tests
```

### 5. Test Authenticated Request
```bash
# Get user profile
curl http://localhost:3000/v1/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Origin: http://localhost:8080" \
  -b cookies.txt \
  -v

# Expected:
✅ 200 OK
✅ User profile data returned
✅ No CORS errors
```

### 6. Test CORS Preflight
```bash
# Test OPTIONS request
curl -X OPTIONS http://localhost:3000/v1/user/login \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v

# Expected response headers:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

---

## Feature-Specific Tests

### Chat System
```bash
# 1. Connect WebSocket
# In browser console:
const ws = new WebSocket('ws://localhost:3000/v1/chat/ws?token=YOUR_TOKEN');
ws.onopen = () => console.log('✅ WebSocket connected');
ws.onmessage = (e) => console.log('📨 Message:', e.data);
ws.onerror = (e) => console.error('❌ WebSocket error:', e);

# 2. Send message
# Via frontend chat interface or:
curl -X POST http://localhost:3000/v1/message/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiver_uid":"FRIEND_ID","content":"Hello!"}' \
  -b cookies.txt

# 3. Get messages
curl http://localhost:3000/v1/message/direct?friend_uid=FRIEND_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt
```

### Friend Management
```bash
# Send friend request
curl -X POST http://localhost:3000/v1/friend/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_uid":"USER_ID"}' \
  -b cookies.txt

# Get friends list
curl http://localhost:3000/v1/friend/friends \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Get pending requests
curl http://localhost:3000/v1/friend/pending \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Accept friend request
curl -X PUT http://localhost:3000/v1/friend/respond \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"request_id":"REQUEST_ID","action":"accept"}' \
  -b cookies.txt
```

### 2FA (TOTP)
```bash
# Get 2FA status
curl http://localhost:3000/v1/totp/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Get QR code for setup
curl http://localhost:3000/v1/totp/qr-code \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Enable 2FA
curl -X PUT http://localhost:3000/v1/totp/enable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Verify TOTP code
curl -X POST http://localhost:3000/v1/totp/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}' \
  -b cookies.txt

# Disable 2FA
curl -X PUT http://localhost:3000/v1/totp/disable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt
```

### Tournament System
```bash
# Create tournament
curl -X POST http://localhost:3000/v1/tournament/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Tournament","maxPlayers":8}' \
  -b cookies.txt

# Get tournaments
curl http://localhost:3000/v1/tournament/list \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Join tournament
curl -X POST http://localhost:3000/v1/tournament/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tournament_id":"TOURNAMENT_ID"}' \
  -b cookies.txt
```

---

## Browser Console Tests

### Check CORS Headers
```javascript
// In browser console (F12)
fetch('http://localhost:3000/v1/user/profile', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  }
})
.then(r => {
  console.log('✅ Status:', r.status);
  console.log('✅ CORS Origin:', r.headers.get('Access-Control-Allow-Origin'));
  console.log('✅ CORS Credentials:', r.headers.get('Access-Control-Allow-Credentials'));
  console.log('✅ Content-Type:', r.headers.get('Content-Type'));
  return r.json();
})
.then(data => console.log('✅ Data:', data))
.catch(err => console.error('❌ Error:', err));
```

### Check for CORB Errors
```javascript
// Open browser console (F12) and check for:
// ❌ BAD: "Cross-Origin Read Blocking (CORB) blocked..."
// ❌ BAD: "No 'Access-Control-Allow-Origin' header..."
// ✅ GOOD: No CORS or CORB errors

// Also check Network tab:
// 1. Click on any API request
// 2. Check "Response Headers"
// 3. Verify CORS headers are present
```

---

## Docker Health Checks

### Check Service Status
```bash
# Check all containers
docker-compose ps

# Expected output:
NAME              STATUS
ft_backend        Up 30 seconds (healthy)
ft_frontend       Up 30 seconds

# Check health
docker inspect ft_backend --format='{{.State.Health.Status}}'
# Expected: healthy
```

### Check Service Logs
```bash
# Backend logs
docker logs ft_backend -f

# Look for:
✅ "Prisma client connected"
✅ "Server listening at http://0.0.0.0:3000"
❌ No error messages

# Frontend logs
docker logs ft_frontend -f

# Look for:
✅ Nginx started successfully
❌ No 502 or 503 errors
```

### Test Service Communication
```bash
# From inside backend container
docker exec ft_backend curl http://localhost:3000/health

# Expected:
{"status":"ok","timestamp":"2026-01-05T..."}
```

---

## Performance Tests

### Load Test Registration
```bash
# Install apache bench (if needed)
# apt-get install apache2-utils

# Test registration endpoint
ab -n 100 -c 10 -p payload.json -T application/json \
  http://localhost:3000/v1/user/register

# payload.json:
{"email":"test@example.com","name":"Test","password":"password123"}

# Check:
✅ No failed requests
✅ Reasonable response times
✅ No CORS errors in logs
```

### WebSocket Load Test
```bash
# Install websocket tool
npm install -g wscat

# Connect multiple clients
for i in {1..10}; do
  wscat -c "ws://localhost:3000/v1/chat/ws?token=YOUR_TOKEN" &
done

# Check:
✅ All connections successful
✅ Messages delivered to all clients
✅ No connection drops
```

---

## Troubleshooting

### CORS Error in Browser
```
❌ Error: No 'Access-Control-Allow-Origin' header is present

Checks:
1. Verify Origin header in request: http://localhost:8080
2. Check backend CORS config allows this origin
3. Verify credentials: 'include' is set in fetch
4. Check response headers in Network tab
```

### CORB Blocked Response
```
❌ Error: Cross-Origin Read Blocking (CORB) blocked cross-origin response

Checks:
1. Verify Content-Type header in response: application/json
2. Check nosniff header is not blocking JSON
3. Verify response is valid JSON
4. Check credentials are properly set
```

### Cookie Not Set
```
❌ Error: access_token cookie not present

Checks:
1. Verify Set-Cookie header in response
2. Check httpOnly and sameSite settings
3. Verify domain matches (localhost)
4. Check credentials: 'include' in fetch
```

### WebSocket Connection Failed
```
❌ Error: WebSocket connection failed

Checks:
1. Verify token is included in URL query
2. Check WebSocket proxy in nginx.conf
3. Verify Upgrade and Connection headers
4. Check firewall rules for WebSocket
```

### 401 Unauthorized
```
❌ Error: 401 Unauthorized

Checks:
1. Verify JWT token is valid (not expired)
2. Check Authorization header format: "Bearer TOKEN"
3. Verify token in cookie if using cookies
4. Check token is not blacklisted
5. Verify 2FA is completed if required
```

---

## Success Criteria

### ✅ System is Working Correctly When:

**Browser Console:**
- ✅ No CORS errors
- ✅ No CORB warnings
- ✅ All fetch requests return 200/201
- ✅ Cookies are set correctly

**Network Tab:**
- ✅ OPTIONS requests return 204
- ✅ All responses have CORS headers
- ✅ Content-Type is application/json
- ✅ Credentials are sent and received

**Functionality:**
- ✅ User can register and login
- ✅ Authentication persists across pages
- ✅ Chat messages send and receive
- ✅ Friend requests work
- ✅ 2FA can be enabled and verified
- ✅ Tournament features work

**Backend Logs:**
- ✅ No CORS rejection messages
- ✅ All requests processed successfully
- ✅ Database queries execute without errors

---

## Automated Test Script

```bash
#!/bin/bash
# save as: test-system.sh

echo "🧪 Testing ft_transcendence system..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test health endpoint
echo -n "Testing health endpoint... "
HEALTH=$(curl -s http://localhost:3000/health)
if [[ $HEALTH == *"ok"* ]]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  exit 1
fi

# Test CORS preflight
echo -n "Testing CORS preflight... "
CORS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3000/v1/user/login)
if [ "$CORS" -eq "204" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL (Status: $CORS)${NC}"
fi

# Test registration
echo -n "Testing registration endpoint... "
REG=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{"email":"test'$RANDOM'@example.com","name":"Test","password":"password123"}' \
  http://localhost:3000/v1/user/register)
if [ "$REG" -eq "201" ] || [ "$REG" -eq "409" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL (Status: $REG)${NC}"
fi

echo ""
echo "🎉 Testing complete!"
```

Make it executable and run:
```bash
chmod +x test-system.sh
./test-system.sh
```

---

## Continuous Monitoring

### Monitor Logs in Real-Time
```bash
# Terminal 1: Backend logs
docker logs ft_backend -f | grep -i "error\|cors\|fail"

# Terminal 2: Frontend/nginx logs
docker logs ft_frontend -f | grep -i "error\|502\|503"

# Terminal 3: Run tests
./test-system.sh
```

### Check Metrics
```bash
# Request count
docker logs ft_backend | grep "POST /v1" | wc -l

# Error rate
docker logs ft_backend | grep -i "error" | wc -l

# CORS rejections
docker logs ft_backend | grep "CORS blocked" | wc -l
```

---

**Remember:** 
- All tests should pass with no CORS/CORB errors
- Check browser console for client-side errors
- Check Docker logs for server-side errors
- Use Network tab to inspect headers and responses

**For Production:**
- Use HTTPS instead of HTTP
- Set proper JWT_SECRET and CKE_SECRET
- Configure OAuth credentials
- Enable rate limiting
- Set up monitoring and alerting
