Write-Host "===============================================" -ForegroundColor Green
Write-Host "RESTARTING AUTOMATED TICKET DISPATCHER" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process ng -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendPath = "c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Angular Frontend..." -ForegroundColor Yellow
$frontendPath = "c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Angular Frontend Starting...' -ForegroundColor Green; ng serve"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "SERVICES STARTING..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both services are starting in separate windows." -ForegroundColor Yellow
Write-Host "Wait a few moments for them to fully start." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
