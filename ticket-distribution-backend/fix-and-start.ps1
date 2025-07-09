Write-Host "========================================" -ForegroundColor Green
Write-Host "AUTOMATED TICKET DISPATCHER - FIX 404" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Creating missing Customer/Agent profiles..." -ForegroundColor Yellow
node src/createMissingProfiles.js
Write-Host ""

Write-Host "Step 2: Starting backend server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server when done testing" -ForegroundColor Cyan
Write-Host ""
npm start
