@echo off
echo ==========================================
echo   Ticket System Backend with Auto-Setup
echo ==========================================
echo.
echo 📋 This will:
echo   1. Start MongoDB service
echo   2. Start backend server
echo   3. Auto-create default agents
echo.
echo 🔑 Default Agent Credentials:
echo   AGENT: agent@company.com / agent123
echo   AGENT: sarah.support@company.com / agent123  
echo   ADMIN: admin@company.com / admin123
echo.
echo ==========================================
echo.

echo 🔧 Starting MongoDB...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ MongoDB service might already be running
)

echo.
echo 🚀 Starting backend server with auto-setup...
echo 💡 Agents will be created automatically on startup
echo.

npm start

echo.
echo 🏁 Server stopped
pause
