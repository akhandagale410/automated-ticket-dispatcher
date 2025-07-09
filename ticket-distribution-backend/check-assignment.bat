@echo off
echo ==========================================
echo   Check Assigned Tickets
echo ==========================================
echo.
echo 🔍 This will check tickets assigned to agent@company.com
echo 📋 Database: ticket-distribution
echo.
echo ==========================================
echo.

echo 🔧 Starting MongoDB...
net start MongoDB 2>nul
if %errorlevel% == 0 (
    echo ✅ MongoDB started successfully
) else (
    echo ⚠️  MongoDB was already running or failed to start
)
echo.

echo 📂 Changing to backend directory...
cd /d "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"

echo 🔍 Checking assigned tickets...
node check-assigned-tickets.js

echo.
echo ✅ Check completed!
pause
