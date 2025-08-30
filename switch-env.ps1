# Plex Request Tool - Environment Switcher
# This script allows seamless switching between local and tunneled environments

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("localhost", "tunnel")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$TunnelUrl
)

# Function to write colored output
function Write-Status {
    param($Message, $Color = "Green")
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Color
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

# Function to update API configuration
function Update-ApiConfig {
    param($BaseUrl)
    
    $apiConfigPath = "src\config\api.ts"
    $content = Get-Content $apiConfigPath -Raw
    
    # Update the BASE_URL line
    $newContent = $content -replace 'BASE_URL:\s*''[^'']*''', "BASE_URL: '$BaseUrl'"
    
    Set-Content -Path $apiConfigPath -Value $newContent -NoNewline
}

# Function to stop existing services
function Stop-Services {
    Write-Info "Stopping existing services..."
    
    # Stop any running Node.js processes for this project
    Get-Process | Where-Object { 
        $_.ProcessName -eq "node" -and 
        $_.CommandLine -like "*plex-request*" -or
        $_.CommandLine -like "*backend*" -or
        $_.CommandLine -like "*npm start*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop any localtunnel processes
    Get-Process | Where-Object { 
        $_.ProcessName -eq "lt" -or
        $_.ProcessName -eq "localtunnel"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 2
}

# Function to start local services
function Start-LocalServices {
    Write-Info "Starting local services..."
    
    # Start backend
    Start-Process -FilePath "cmd" -ArgumentList "/k", "cd backend && npm start" -WindowStyle Normal
    Start-Sleep -Seconds 5
    
    # Start frontend
    Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -WindowStyle Normal
    Start-Sleep -Seconds 3
    
    Write-Status "Local services started!"
}

# Function to start tunneled services
function Start-TunneledServices {
    Write-Info "Starting tunneled services..."
    
    # Start backend
    Start-Process -FilePath "cmd" -ArgumentList "/k", "cd backend && npm start" -WindowStyle Normal
    Start-Sleep -Seconds 5
    
    # Start frontend
    Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -WindowStyle Normal
    Start-Sleep -Seconds 3
    
    # Start backend tunnel
    Start-Process -FilePath "cmd" -ArgumentList "/k", "lt --port 3001 --local-host localhost" -WindowStyle Normal
    Start-Sleep -Seconds 2
    
    # Start frontend tunnel
    Start-Process -FilePath "cmd" -ArgumentList "/k", "lt --port 3000 --local-host localhost" -WindowStyle Normal
    
    Write-Status "Tunneled services starting up!"
}

# Main execution
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Plex Request Tool - Environment Switcher" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

try {
    # Stop existing services first
    Stop-Services
    
    if ($Environment -eq "localhost") {
        Write-Info "Switching to localhost environment..."
        
        # Update API config to localhost
        Update-ApiConfig "http://localhost:3001/api"
        Write-Status "Switched to localhost successfully!"
        
        # Start local services
        Start-LocalServices
        
        Write-Host ""
        Write-Host "Localhost Setup Complete:" -ForegroundColor Green
        Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Test the setup:" -ForegroundColor Yellow
        Write-Host "Open http://localhost:3000" -ForegroundColor White
        Write-Host "Verify everything works - sort toggle, search, etc." -ForegroundColor White
        
    } elseif ($Environment -eq "tunnel") {
        Write-Info "Starting tunneled environment..."
        
        # Start tunneled services first (without updating API config yet)
        Start-TunneledServices
        
        Write-Host ""
        Write-Host "Tunneled services starting up!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Wait for both tunnel windows to show URLs" -ForegroundColor White
        Write-Host "2. Copy the backend URL (port 3001) - it will look like:" -ForegroundColor White
        Write-Host "   https://random-name.loca.lt" -ForegroundColor Cyan
        Write-Host "3. Run: .\update-api-url.ps1 'https://your-backend-url.loca.lt/api'" -ForegroundColor Cyan
        Write-Host "4. Refresh your browser to use the new API URL" -ForegroundColor White
        Write-Host ""
        Write-Host "Example:" -ForegroundColor Yellow
        Write-Host ".\update-api-url.ps1 'https://lovely-geese-beam.loca.lt/api'" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Environment switching completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Error ("Failed to switch environment: " + $_.Exception.Message)
    exit 1
}
