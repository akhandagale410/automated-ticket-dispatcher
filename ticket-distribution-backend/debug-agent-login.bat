@echo off
echo ========================================
echo  DEBUG: Agent Login Issue
echo ========================================
echo.

cd /d "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"

echo 1. Running detailed agent debug analysis...
node src/debug-agent-issue.js
echo.

echo 2. Starting debug server with enhanced logging...
echo    The server will show detailed error information
echo    Test agent login at: http://localhost:3000/api/auth/login
echo    Credentials: {"email":"agent@company.com","password":"agent123"}
echo.
echo    Press Ctrl+C to stop the server when done testing
echo.

node src/debug-server-enhanced.js
