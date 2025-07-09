@echo off
echo ===============================================
echo RESTARTING BACKEND SERVER ONLY
echo ===============================================
echo.

echo Stopping Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server...
cd /d "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"
echo Backend Server will run on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm start
