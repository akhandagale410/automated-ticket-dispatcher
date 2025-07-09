@echo off
echo ===================================
echo RESTARTING BACKEND SERVER
echo ===================================
echo.

echo Stopping any existing Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
echo Server will run on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm start
