@echo off
echo ===============================================
echo CHECKING SERVICE STATUS
echo ===============================================
echo.

echo Checking Backend Server (Port 3000)...
netstat -ano | findstr :3000
if %errorlevel% == 0 (
    echo ✓ Backend Server is running on port 3000
) else (
    echo ✗ Backend Server is not running
)

echo.
echo Checking Frontend Server (Port 4200)...
netstat -ano | findstr :4200
if %errorlevel% == 0 (
    echo ✓ Frontend Server is running on port 4200
) else (
    echo ✗ Frontend Server is not running
)

echo.
echo Checking Node.js processes...
tasklist | findstr node.exe
if %errorlevel% == 0 (
    echo ✓ Node.js processes found
) else (
    echo ✗ No Node.js processes running
)

echo.
echo ===============================================
echo QUICK ACCESS URLS
echo ===============================================
echo Backend API: http://localhost:3000/api
echo Frontend App: http://localhost:4200
echo API Test: http://localhost:3000/api/tickets/public/stats
echo.
pause
