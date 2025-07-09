Write-Host "===================================" -ForegroundColor Green
Write-Host "RESTARTING BACKEND SERVER" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Server will run on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

npm start
