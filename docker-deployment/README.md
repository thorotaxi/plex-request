# Plex Request Tool - Docker Deployment

## Quick Start for Synology NAS

### 1. Upload Files
Upload this entire folder to your Synology NAS at:
```
/volume1/docker/plex-request/
```

### 2. Deploy
SSH into your Synology and run:
```bash
cd /volume1/docker/plex-request
docker-compose up -d --build
```

### 3. Access
Open your browser and go to:
```
http://your-synology-ip
```

## What's Included
- ✅ Backend API (Node.js/Express)
- ✅ Frontend (React)
- ✅ Database (SQLite)
- ✅ Web Server (Nginx)
- ✅ All configuration files

## Management
- **Start**: `docker-compose up -d`
- **Stop**: `docker-compose down`
- **Logs**: `docker-compose logs`
- **Update**: `docker-compose up -d --build`

## Requirements
- Synology NAS with Docker support
- DSM 6.0 or later
- Docker Package installed

See `DOCKER-DEPLOYMENT.md` for detailed instructions.
