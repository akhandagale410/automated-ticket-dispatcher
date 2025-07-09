@echo off
echo Starting Automated Ticket Distribution Backend Server...
echo.
echo Server will start on http://localhost:3000
echo.
echo Available endpoints after startup:
echo - GET  /api/health
echo - GET  /api/tickets/public/all
echo - GET  /api/tickets/public/stats/dashboard  
echo - POST /api/auth/login
echo.
echo Press Ctrl+C to stop the server
echo.
node src/app.js
