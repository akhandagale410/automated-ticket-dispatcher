@echo off
echo ===============================================
echo RESTARTING AUTOMATED TICKET DISPATCHER
echo ===============================================
echo.

echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im ng.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server...
cd /d "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"
start "Backend Server" cmd /k "echo Backend Server Starting... && npm start"
timeout /t 3 /nobreak >nul

echo.
echo Starting Angular Frontend...
cd /d "c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher"
start "Angular Frontend" cmd /k "echo Angular Frontend Starting... && ng serve"

echo.
echo ===============================================
echo SERVICES STARTING...
echo ===============================================
echo Backend will be available at: http://localhost:3000
echo Frontend will be available at: http://localhost:4200
echo.
echo Both services are starting in separate windows.
echo Wait a few moments for them to fully start.
echo.
pause
