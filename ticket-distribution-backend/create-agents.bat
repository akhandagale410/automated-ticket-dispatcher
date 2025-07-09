@echo off
echo ==========================================
echo    Agent Data Push - ticket-distribution
echo ==========================================
echo.

echo 🔧 Starting MongoDB service...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ MongoDB service might already be running or failed to start
    echo Continuing with script...
)

echo.
echo 🔄 Waiting for MongoDB to be ready...
timeout /t 3 /nobreak >nul

echo.
echo 📊 Running agent data push script...
echo Database: mongodb://localhost:27017/ticket-distribution
echo.

node push-agents-correct-db.js

echo.
echo 🎯 Agent creation completed!
echo.
echo 🔑 Default Agent Credentials:
echo AGENT: agent@company.com / agent123
echo AGENT: sarah.support@company.com / agent123
echo ADMIN: admin@company.com / admin123
echo AGENT: lisa.senior@company.com / agent123
echo.
echo 💡 Next: Start the backend server with 'npm start'
echo.
pause
