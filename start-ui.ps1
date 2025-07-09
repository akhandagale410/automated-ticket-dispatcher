Write-Host "==========================================" -ForegroundColor Green
Write-Host "STARTING ANGULAR UI SERVER" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Checking if Angular CLI is installed..." -ForegroundColor Yellow
try {
    ng version | Out-Null
    Write-Host "Angular CLI found!" -ForegroundColor Green
} catch {
    Write-Host "Angular CLI not found. Installing globally..." -ForegroundColor Yellow
    npm install -g @angular/cli
}

Write-Host ""
Write-Host "Navigating to Angular project directory..." -ForegroundColor Yellow
Set-Location "c:\hackton\automated-ticket-dispatcher\automated-ticket-dispatcher"

Write-Host ""
Write-Host "Installing dependencies (if needed)..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting Angular development server..." -ForegroundColor Yellow
Write-Host "UI will be available at: http://localhost:4200" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

ng serve --open
