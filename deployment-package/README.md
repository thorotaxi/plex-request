# Plex Request Tool - Deployment Package

## Quick Start

### Windows:
1. Double-click `start.bat`
2. Open http://localhost:3000 in your browser

### Linux/Mac:
1. Make the script executable: `chmod +x start.sh`
2. Run: `./start.sh`
3. Open http://localhost:3000 in your browser

## Requirements

- Node.js (version 16 or higher)
- npm or yarn
- Ports 3000 and 3001 available

## Files Included

- `public/` - Frontend application (React build)
- `backend/` - Backend server (Express.js + SQLite)
- `.env` - Environment configuration
- `start.bat` - Windows startup script
- `DEPLOYMENT.md` - Detailed deployment guide

## Troubleshooting

1. Make sure Node.js is installed: `node --version`
2. Check that ports 3000 and 3001 are not in use
3. Verify your TMDb API key is in the `.env` file
4. Check the console output for error messages
