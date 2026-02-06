$body = @{
    email = "admin@salon.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://barber-backend-main.vercel.app/api/auth/login" -Method POST -ContentType "application/json" -Body $body

Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 10
