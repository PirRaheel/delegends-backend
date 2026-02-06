$body = @{
    email = "admin@salon.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://barber-backend-main.vercel.app/api/auth/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ PRODUCTION LOGIN SUCCESS" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host "User: $($response.user.name)" -ForegroundColor Cyan
    Write-Host "Role: $($response.user.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ PRODUCTION LOGIN FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
