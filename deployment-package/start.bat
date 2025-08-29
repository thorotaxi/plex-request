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
