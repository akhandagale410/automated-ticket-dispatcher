@echo off
echo ==========================================
echo CHECKING SERVER STATUS
echo ==========================================
echo.

echo Checking Backend Server (Port 3000)...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ✓ Backend server is running on port 3000
) else (
    echo ✗ Backend server is NOT running on port 3000
)

echo.
echo Checking Angular UI Server (Port 4200)...
netstat -ano | findstr :4200
if %errorlevel% equ 0 (
    echo ✓ Angular UI server is running on port 4200
) else (
    echo ✗ Angular UI server is NOT running on port 4200
)

echo.
echo Checking Node.js processes...
tasklist | findstr node.exe

echo.
echo ==========================================
echo Access URLs:
echo Backend API: http://localhost:3000
echo Frontend UI: http://localhost:4200
echo ==========================================
pause
