@echo off
echo ==========================================
echo   Ticket Assignment Script
echo ==========================================
echo.
echo 🎯 This will assign tickets to agent@company.com
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

echo 🎯 Running ticket assignment script...
node assign-tickets-to-agent.js

echo.
echo ✅ Script completed!
echo.
echo 🔍 You can now check the assignment with:
echo    node check-assigned-tickets.js
echo.
pause
