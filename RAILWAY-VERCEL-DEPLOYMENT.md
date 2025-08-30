# Railway + Vercel Deployment Guide

## Overview
This guide will help you deploy your Plex Request app using:
- **Railway**: Backend (Node.js + Express + SQLite)
- **Vercel**: Frontend (React + TypeScript)

## Prerequisites
- GitHub account
- Railway account (railway.app)
- Vercel account (vercel.com)

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway + Vercel deployment"
git push origin master
```

### 1.2 Create Separate Repositories (Recommended)
For better separation of concerns, create two repositories:
- `plex-request-frontend` (for Vercel)
- `plex-request-backend` (for Railway)

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your backend repository or the main repo

### 2.2 Configure Railway Settings
1. In your Railway project dashboard:
   - **Root Directory**: `backend` (if using main repo)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Environment Variables (Optional)
Add these in Railway dashboard if needed:
```
NODE_ENV=production
PORT=3001
```

### 2.4 Deploy
1. Railway will automatically detect your Node.js app
2. Click "Deploy" to start the build process
3. Wait for deployment to complete

### 2.5 Get Your Backend URL
1. After successful deployment, Railway will provide a URL
2. Copy this URL (e.g., `https://your-app-name.railway.app`)
3. **Save this URL** - you'll need it for the frontend

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository

### 3.2 Configure Vercel Settings
1. **Framework Preset**: Create React App
2. **Root Directory**: `.` (root of your project)
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

### 3.3 Set Environment Variables
1. In Vercel project settings, add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-railway-backend-url.railway.app/api`
   - **Environment**: Production, Preview, Development

### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your React app
3. Wait for deployment to complete

### 3.5 Get Your Frontend URL
1. Vercel will provide a URL (e.g., `https://your-app-name.vercel.app`)
2. Your app is now live!

## Step 4: Test Your Deployment

### 4.1 Test Backend
```bash
curl https://your-railway-backend-url.railway.app/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 4.2 Test Frontend
1. Visit your Vercel URL
2. Try creating a request
3. Check if it connects to your Railway backend

## Step 5: Custom Domain (Optional)

### 5.1 Railway Custom Domain
1. In Railway dashboard, go to "Settings"
2. Add custom domain
3. Update DNS records as instructed

### 5.2 Vercel Custom Domain
1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your domain
3. Update DNS records as instructed

## Troubleshooting

### Common Issues

#### Backend Issues
- **Port not found**: Ensure Railway uses `PORT` environment variable
- **Database errors**: SQLite file should be created automatically
- **CORS errors**: Backend already has CORS configured

#### Frontend Issues
- **API connection failed**: Check `REACT_APP_API_URL` environment variable
- **Build errors**: Ensure all dependencies are in `package.json`
- **404 errors**: Check Vercel routing configuration

### Debug Commands
```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Test API locally
curl http://localhost:3001/api/health
```

## Cost Estimation
- **Railway**: $5/month (after free tier)
- **Vercel**: Free tier (generous limits)
- **Total**: ~$5/month

## Next Steps
1. Set up monitoring and alerts
2. Configure automatic deployments
3. Set up custom domains
4. Add SSL certificates (automatic with both platforms)

## Support
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- This project: Check `CURRENT_STATE.md` for latest updates
