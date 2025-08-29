# Docker Deployment Guide for Synology NAS

## Overview
This guide will help you deploy the Plex Request Tool on a Synology NAS using Docker.

## Prerequisites
- Synology NAS with Docker support
- DSM 6.0 or later
- Docker Package installed from Synology Package Center

## Quick Start

### 1. Prepare Your Files
1. **Build the frontend** (if not already done):
   ```bash
   npm run build
   ```

2. **Create deployment folder** on your Synology:
   ```
   /volume1/docker/plex-request/
   ```

3. **Copy these files** to the deployment folder:
   - `Dockerfile`
   - `docker-compose.yml`
   - `nginx.conf`
   - `.dockerignore`
   - `backend/` folder
   - `build/` folder
   - `.env` file (with your TMDb API key)

### 2. Deploy Using Docker Compose

#### Option A: SSH into Synology
```bash
# Connect to your Synology via SSH
ssh admin@your-synology-ip

# Navigate to deployment folder
cd /volume1/docker/plex-request

# Build and start containers
docker-compose up -d --build
```

#### Option B: Using Synology Docker GUI
1. Open **Docker** in Synology DSM
2. Go to **Image** tab
3. Click **Add** → **Add from Dockerfile**
4. Select your `Dockerfile`
5. Build the image
6. Create containers manually using the `docker-compose.yml` configuration

### 3. Access Your Application
- **Frontend**: `http://your-synology-ip`
- **Backend API**: `http://your-synology-ip:3001`

## Configuration

### Environment Variables
Create a `.env` file in your deployment folder:
```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
NODE_ENV=production
PORT=3001
```

### Port Configuration
- **Frontend**: Port 80 (standard HTTP)
- **Backend**: Port 3001 (API)
- **Database**: SQLite file (persisted via volume)

### Volume Mounts
- `./data:/app/data` - Application data
- `./backend/plex-requests.db:/app/plex-requests.db` - Database persistence
- `./build:/usr/share/nginx/html` - Frontend files

## Management Commands

### Start the application:
```bash
docker-compose up -d
```

### Stop the application:
```bash
docker-compose down
```

### View logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

### Update the application:
```bash
# Stop containers
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Backup database:
```bash
# Copy the database file
cp ./backend/plex-requests.db ./backup/plex-requests-$(date +%Y%m%d).db
```

## Troubleshooting

### Common Issues:

1. **Port 80 already in use**:
   - Change port in `docker-compose.yml`:
   ```yaml
   ports:
     - "8080:80"  # Use port 8080 instead
   ```

2. **Permission issues**:
   - Ensure the deployment folder has proper permissions
   - Run: `chmod -R 755 /volume1/docker/plex-request`

3. **Database not persisting**:
   - Check volume mounts in `docker-compose.yml`
   - Ensure the database file path is correct

4. **Frontend not loading**:
   - Verify `build/` folder contains the React build
   - Check nginx logs: `docker-compose logs frontend`

### Health Checks:
- **Backend**: `http://your-synology-ip:3001/api/health`
- **Frontend**: `http://your-synology-ip`

## Security Considerations

1. **Firewall**: Configure Synology firewall to allow ports 80 and 3001
2. **SSL**: Consider adding SSL certificate for HTTPS
3. **Access Control**: Use Synology's access control features
4. **Backups**: Regular backups of the database file

## Performance Optimization

1. **Resource Limits**: Set CPU/memory limits in Docker
2. **Caching**: Nginx is configured with gzip compression
3. **Database**: SQLite is suitable for small to medium usage

## Monitoring

### Check container status:
```bash
docker-compose ps
```

### Monitor resource usage:
```bash
docker stats
```

### View real-time logs:
```bash
docker-compose logs -f
```

## Support

If you encounter issues:
1. Check container logs
2. Verify file permissions
3. Ensure all required files are present
4. Test network connectivity
5. Check Synology Docker package is up to date
