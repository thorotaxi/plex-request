# Plex Request Tool - Deployment Guide

## Overview
This is a full-stack application with:
- **Frontend**: React.js (built and optimized)
- **Backend**: Express.js + SQLite database
- **API**: RESTful endpoints for request management

## Deployment Options

### Option 1: Direct File Transfer (Recommended for Friend's Server)

#### What to Send to Your Friend:
1. **Frontend**: The `build/` folder (already optimized)
2. **Backend**: The `backend/` folder
3. **Environment**: `.env` file with your TMDb API key
4. **Database**: `backend/plex-requests.db` (if you want to keep existing data)

#### Server Requirements:
- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **Port 3001** available for the backend API
- **Port 80/443** available for the frontend (or any port)

#### Deployment Steps:

1. **On your friend's server, create a directory:**
   ```bash
   mkdir plex-request-tool
   cd plex-request-tool
   ```

2. **Copy the files:**
   - Copy `build/` folder → `public/` (for serving static files)
   - Copy `backend/` folder → `backend/`
   - Copy `.env` file → root directory

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Start the backend server:**
   ```bash
   node server.js
   ```
   The API will run on `http://localhost:3001`

5. **Serve the frontend:**
   ```bash
   # Option A: Using Node.js serve
   npm install -g serve
   serve -s public -l 80
   
   # Option B: Using nginx (if available)
   # Configure nginx to serve files from public/ directory
   
   # Option C: Using Apache (if available)
   # Copy files to /var/www/html/
   ```

### Option 2: GitHub Repository (For Version Control)

#### Benefits:
- Easy updates and rollbacks
- Version history
- Collaboration features
- Automated deployment possible

#### Steps:
1. **Publish to GitHub:**
   - Click "Publish Branch" in Cursor
   - Choose "GitHub" as the remote
   - Create a new repository

2. **On your friend's server:**
   ```bash
   git clone https://github.com/yourusername/plex-request-tool.git
   cd plex-request-tool
   npm run build
   # Follow steps 3-5 from Option 1
   ```

### Option 3: Docker Deployment (Advanced)

#### Create a Dockerfile:
```dockerfile
# Backend
FROM node:16-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 3001
CMD ["node", "server.js"]
```

#### Create docker-compose.yml:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./backend/plex-requests.db:/app/plex-requests.db
    environment:
      - NODE_ENV=production
  
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./build:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## Environment Configuration

### Required Environment Variables:
Create a `.env` file on the server:
```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
NODE_ENV=production
PORT=3001
```

### Database Setup:
The SQLite database (`plex-requests.db`) will be created automatically on first run, or you can initialize it manually:
```bash
cd backend
node init-db.js
```

## Security Considerations

1. **API Key**: Keep your TMDb API key secure
2. **Database**: Ensure the SQLite database file has proper permissions
3. **CORS**: The backend is configured to allow requests from the frontend
4. **Ports**: Consider using a reverse proxy (nginx) for production

## Troubleshooting

### Common Issues:
1. **Port already in use**: Change the port in `backend/server.js`
2. **Database permissions**: Ensure the server can read/write the database file
3. **CORS errors**: Check that the frontend URL is allowed in the backend CORS configuration
4. **API key issues**: Verify the TMDb API key is correct and has proper permissions

### Logs:
- Backend logs will appear in the console where you run `node server.js`
- Check the browser's developer console for frontend errors

## Updates and Maintenance

### To update the application:
1. **Stop the current server**
2. **Replace the files** (or pull from Git)
3. **Rebuild the frontend** (if using source code)
4. **Restart the backend server**

### Database backups:
```bash
cp backend/plex-requests.db backend/plex-requests.db.backup
```

## Performance Optimization

- The frontend is already optimized (minified, compressed)
- Consider using a CDN for static assets
- Enable gzip compression on the web server
- Use a process manager like PM2 for the Node.js backend

## Support

If you encounter issues:
1. Check the logs (backend console, browser console)
2. Verify all dependencies are installed
3. Ensure ports are available and not blocked by firewall
4. Test the API endpoints directly: `http://server-ip:3001/api/health`
