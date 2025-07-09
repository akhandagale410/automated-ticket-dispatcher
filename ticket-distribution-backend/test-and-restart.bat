@echo off
echo ===================================
echo Automated Ticket Distribution System
echo Backend Restart and Endpoint Testing
echo ===================================
echo.

echo Stopping any running servers...
taskkill /f /im node.exe 2>nul

echo.
echo Starting backend server...
start /b node src/app.js > server.log 2>&1
echo Server started in background, output being logged to server.log

echo.
echo Waiting for server to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo Testing agent endpoints...
node fix-agent-endpoints.js

echo.
echo Testing complete!
echo You can check the server log with: type server.log

echo.
echo NOTE: The server is still running in the background.
echo To stop it, use Ctrl+C in this window and confirm with Y.
echo.
