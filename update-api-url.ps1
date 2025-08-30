# Simple API URL Updater
# This script just updates the API configuration without restarting services

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiUrl
)

# Function to update API configuration
function Update-ApiConfig {
    param($BaseUrl)
    
    $apiConfigPath = "src\config\api.ts"
    $content = Get-Content $apiConfigPath -Raw
    
    # Update the BASE_URL line
    $newContent = $content -replace 'BASE_URL:\s*''[^'']*''', "BASE_URL: '$BaseUrl'"
    
    Set-Content -Path $apiConfigPath -Value $newContent -NoNewline
}

Write-Host "Updating API URL to: $ApiUrl" -ForegroundColor Yellow
Update-ApiConfig $ApiUrl
Write-Host "API URL updated successfully!" -ForegroundColor Green
Write-Host "The React app should automatically pick up the new configuration." -ForegroundColor Cyan
