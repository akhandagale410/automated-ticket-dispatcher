Write-Host "🚀 Starting Automated Ticket Distribution Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Server will start on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Available endpoints after startup:" -ForegroundColor Yellow
Write-Host "   - GET  /api/health" -ForegroundColor White
Write-Host "   - GET  /api/tickets/public/all" -ForegroundColor White  
Write-Host "   - GET  /api/tickets/public/stats/dashboard" -ForegroundColor White
Write-Host "   - GET  /api/tickets/stats/dashboard (requires auth)" -ForegroundColor White
Write-Host "   - POST /api/auth/login" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

try {
    node src/app.js
} catch {
    Write-Host "❌ Error starting server. Make sure MongoDB is running." -ForegroundColor Red
    Write-Host "💡 Try: net start MongoDB" -ForegroundColor Yellow
    pause
}
