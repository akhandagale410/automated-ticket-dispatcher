@echo off
echo ========================================
echo AUTOMATED TICKET DISPATCHER - FIX 404
echo ========================================
echo.

echo Step 1: Creating missing Customer/Agent profiles...
node src/createMissingProfiles.js
echo.

echo Step 2: Starting backend server...
echo Press Ctrl+C to stop the server when done testing
echo.
npm start
