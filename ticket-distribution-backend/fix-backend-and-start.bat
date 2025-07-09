@echo off
echo ========================================
echo  Automated Ticket System - Backend Fix
echo ========================================
echo.

cd /d "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"

echo 1. Testing MongoDB connection...
node src/test-mongodb.js
echo.

echo 2. Fixing user profiles...
node src/fix-user-profiles.js
echo.

echo 3. Testing agent login directly...
node src/test-agent-login.js
echo.

echo 4. Starting backend server...
echo    The server will start on http://localhost:3000
echo    You can test agent login at: http://localhost:3000/api/auth/login
echo    Credentials: {"email":"agent@company.com","password":"agent123"}
echo.

node src/app.js
