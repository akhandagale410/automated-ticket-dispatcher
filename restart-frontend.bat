@echo off
echo ===============================================
echo RESTARTING ANGULAR FRONTEND ONLY
echo ===============================================
echo.

echo Stopping Angular processes...
taskkill /f /im ng.exe 2>nul
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Angular Frontend...
cd /d "c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher"
echo Angular Frontend will run on http://localhost:4200
echo Press Ctrl+C to stop the server
echo.
ng serve
