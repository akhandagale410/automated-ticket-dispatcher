@echo off
echo ==========================================
echo STARTING ANGULAR UI SERVER
echo ==========================================
echo.

echo Checking if Angular CLI is installed...
ng version 2>nul
if %errorlevel% neq 0 (
    echo Angular CLI not found. Installing globally...
    npm install -g @angular/cli
)

echo.
echo Navigating to Angular project directory...
cd c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher

echo.
echo Installing dependencies (if needed)...
npm install

echo.
echo Starting Angular development server...
echo UI will be available at: http://localhost:4200
echo Press Ctrl+C to stop the server
echo.

ng serve --open
