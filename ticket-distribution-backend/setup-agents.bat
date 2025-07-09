@echo off
echo 🚀 Starting MongoDB and creating agent data...

echo.
echo 📋 Agent Users to be Created:
echo.
echo AGENT: agent@company.com / agent123
echo AGENT: sarah.support@company.com / agent123  
echo ADMIN: admin@company.com / admin123
echo AGENT: lisa.senior@company.com / agent123
echo.

echo 🔧 Starting MongoDB service...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ MongoDB service start failed or already running
    echo Trying to start mongod directly...
    start "MongoDB" mongod --dbpath "C:\data\db"
    timeout /t 3 /nobreak >nul
)

echo.
echo 🔄 Waiting for MongoDB to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 📊 Creating agent data...
node push-agent-data.js

echo.
echo 🚀 Starting backend server...
echo You can now test the agent login with the credentials above
echo.
pause
npm start
