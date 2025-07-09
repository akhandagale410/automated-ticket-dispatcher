@echo off
echo ==========================================
echo FIXING 404 ERROR FOR customer@company.com
echo ==========================================
echo.

echo Creating user and Customer profile...
node src/fixSpecificUser.js

echo.
echo Testing the fix...
node src/testYourUser.js

echo.
echo Fix complete! You can now use GET /api/tickets
pause
