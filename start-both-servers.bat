@echo off
echo ==========================================
echo STARTING BOTH UI AND BACKEND SERVERS
echo ==========================================
echo.

echo Starting Backend Server...
start "Backend Server" /D "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend" cmd /k "npm start"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Angular UI Server...
start "Angular UI Server" /D "c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher" cmd /k "ng serve --open"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Press any key to check server status...
pause >nul

echo.
echo Checking server status...
netstat -ano | findstr :3000
netstat -ano | findstr :4200

echo.
echo Both servers should be running now!
pause
