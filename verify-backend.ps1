$body = @{
    email = "admin@salon.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ LOCAL LOGIN SUCCESS" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host "User: $($response.user.name)" -ForegroundColor Cyan
    Write-Host "Role: $($response.user.role)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Backend is working correctly locally" -ForegroundColor Green
    Write-Host "Ready to deploy to Vercel" -ForegroundColor Yellow
} catch {
    Write-Host "❌ LOGIN FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
