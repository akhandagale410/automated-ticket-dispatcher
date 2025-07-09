@echo off
echo Starting Ticket Distribution Backend Server...
echo.
cd /d "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"
echo Current directory: %CD%
echo.
echo Testing agent login first...
node src/test-agent-login.js
echo.
echo Starting main server...
node src/app.js
