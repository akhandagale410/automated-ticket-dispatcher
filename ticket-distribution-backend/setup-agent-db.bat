@echo off
echo 🚀 Setting up Agent Data in Database
echo.

echo 📋 This script will:
echo 1. Start MongoDB service
echo 2. Check current user table
echo 3. Create default agent users and profiles
echo 4. Show login credentials
echo.

echo 🔧 Starting MongoDB...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ MongoDB service not found or already running
)

echo.
echo 🔍 Checking user table and creating agents...
node check-and-setup-agents.js

echo.
echo 🔑 Default Agent Credentials:
echo AGENT: agent@company.com / agent123
echo AGENT: sarah.support@company.com / agent123
echo ADMIN: admin@company.com / admin123
echo.

echo ✅ Agent data setup completed!
echo.
echo 💡 You can now:
echo 1. Start the backend: npm start
echo 2. Login with the credentials above
echo 3. Access the agent dashboard
echo.
pause
