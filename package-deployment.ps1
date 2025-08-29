# Plex Request Tool - Deployment Package Script
# This script creates a deployment package for your friend's server

Write-Host "Creating deployment package for Plex Request Tool..." -ForegroundColor Green

# Create deployment directory
$deploymentDir = "deployment-package"
if (Test-Path $deploymentDir) {
    Remove-Item $deploymentDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deploymentDir | Out-Null

Write-Host "✓ Created deployment directory" -ForegroundColor Green

# Copy frontend build
if (Test-Path "build") {
    Copy-Item -Path "build" -Destination "$deploymentDir/public" -Recurse
    Write-Host "✓ Copied frontend build" -ForegroundColor Green
} else {
    Write-Host "⚠ Frontend build not found. Run 'npm run build' first." -ForegroundColor Yellow
}

# Copy backend
if (Test-Path "backend") {
    Copy-Item -Path "backend" -Destination "$deploymentDir/backend" -Recurse
    Write-Host "✓ Copied backend" -ForegroundColor Green
} else {
    Write-Host "✗ Backend directory not found!" -ForegroundColor Red
    exit 1
}

# Copy environment file
if (Test-Path ".env") {
    Copy-Item -Path ".env" -Destination "$deploymentDir/.env"
    Write-Host "✓ Copied environment file" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found. Create one with your TMDb API key." -ForegroundColor Yellow
}

# Copy deployment guide
if (Test-Path "DEPLOYMENT.md") {
    Copy-Item -Path "DEPLOYMENT.md" -Destination "$deploymentDir/DEPLOYMENT.md"
    Write-Host "✓ Copied deployment guide" -ForegroundColor Green
}

# Create a simple start script
$startScript = @"
@echo off
echo Starting Plex Request Tool...
echo.
echo 1. Installing backend dependencies...
cd backend
npm install
echo.
echo 2. Starting backend server...
start node server.js
echo Backend server started on http://localhost:3001
echo.
echo 3. Starting frontend server...
cd ..
npm install -g serve
serve -s public -l 3000
echo Frontend server started on http://localhost:3000
echo.
echo Application is now running!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
pause
"@

$startScript | Out-File -FilePath "$deploymentDir/start.bat" -Encoding ASCII
Write-Host "✓ Created start script" -ForegroundColor Green

# Create a Linux start script
$linuxStartScript = @"
#!/bin/bash
echo "Starting Plex Request Tool..."

echo "1. Installing backend dependencies..."
cd backend
npm install

echo "2. Starting backend server..."
node server.js &
BACKEND_PID=`$!

echo "3. Starting frontend server..."
cd ..
npm install -g serve
serve -s public -l 3000 &
FRONTEND_PID=`$!

echo "Application is now running!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop"

trap "kill `$BACKEND_PID `$FRONTEND_PID; exit" INT
wait
"@

$linuxStartScript | Out-File -FilePath "$deploymentDir/start.sh" -Encoding UTF8
Write-Host "✓ Created Linux start script" -ForegroundColor Green

# Create a README for the deployment package
$deploymentReadme = @"
# Plex Request Tool - Deployment Package

## Quick Start

### Windows:
1. Double-click start.bat
2. Open http://localhost:3000 in your browser

### Linux/Mac:
1. Make the script executable: chmod +x start.sh
2. Run: ./start.sh
3. Open http://localhost:3000 in your browser

## Manual Setup

See DEPLOYMENT.md for detailed instructions.

## Requirements

- Node.js (version 16 or higher)
- npm or yarn
- Ports 3000 and 3001 available

## Files Included

- public/ - Frontend application (React build)
- backend/ - Backend server (Express.js + SQLite)
- .env - Environment configuration
- start.bat - Windows startup script
- start.sh - Linux/Mac startup script
- DEPLOYMENT.md - Detailed deployment guide

## Troubleshooting

1. Make sure Node.js is installed: node --version
2. Check that ports 3000 and 3001 are not in use
3. Verify your TMDb API key is in the .env file
4. Check the console output for error messages
"@

$deploymentReadme | Out-File -FilePath "$deploymentDir/README.md" -Encoding UTF8
Write-Host "✓ Created deployment README" -ForegroundColor Green

Write-Host "`n🎉 Deployment package created successfully!" -ForegroundColor Green
Write-Host "Location: $deploymentDir" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Zip the '$deploymentDir' folder" -ForegroundColor White
Write-Host "2. Send it to your friend" -ForegroundColor White
Write-Host "3. They can extract and run 'start.bat' (Windows) or './start.sh' (Linux)" -ForegroundColor White
Write-Host "`nThe application will be available at http://localhost:3000" -ForegroundColor Cyan
