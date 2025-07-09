@echo off
echo Starting Automated Ticket Dispatcher System...
echo.

echo Starting Backend Server...
cd /d "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"
start "Backend Server" cmd /k "node src/app.js"

echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
cd /d "c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher"
start "Frontend Server" cmd /k "ng serve --port 4201"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4201
echo.
echo Press any key to exit this script (servers will continue running)
pause
