@echo off
echo 🚀 Starting Ticket System Backend with Agent Setup
echo.

echo 📋 Default Agent Credentials:
echo AGENT: agent@company.com / agent123
echo AGENT: sarah.support@company.com / agent123
echo ADMIN: admin@company.com / admin123
echo.

echo 🔧 Starting MongoDB...
net start MongoDB 2>nul

echo.
echo 🚀 Starting backend server...
echo.
echo 💡 After server starts, you can:
echo 1. POST to http://localhost:3000/api/auth/setup-agents to create default agents
echo 2. Test login with the credentials above
echo 3. Access agent dashboard at /agent-dashboard
echo.

npm start
