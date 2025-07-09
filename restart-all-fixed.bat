@echo off
echo ==========================================
echo RESTARTING UI AND BACKEND SERVERS
echo ==========================================
echo.

echo Step 1: Killing existing Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Starting Backend Server...
start "Backend Server" /D "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend" cmd /k "echo Backend Server Starting... && npm start"

echo.
echo Step 3: Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 4: Starting Angular UI Server (with compilation fix)...
start "Angular UI Server" /D "c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher" cmd /k "echo Angular UI Server Starting... && ng serve --open"

echo.
echo Step 5: Checking server status in 10 seconds...
timeout /t 10 /nobreak >nul

echo.
echo Backend Server Status (Port 3000):
netstat -ano | findstr :3000
echo.
echo Frontend Server Status (Port 4200):
netstat -ano | findstr :4200

echo.
echo ==========================================
echo SERVERS STARTED!
echo Backend API: http://localhost:3000
echo Frontend UI: http://localhost:4200
echo ==========================================
echo.
echo If you see compilation errors in the Angular window,
echo the fixes have been applied and it should recompile automatically.
echo.
pause
