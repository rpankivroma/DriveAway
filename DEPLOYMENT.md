# DriveAway Deployment Guide

## Overview
This guide explains how to deploy the DriveAway application using Docker containers to Render (backend) and Vercel (frontend), with the database hosted on Neon.

## Prerequisites
- Docker and Docker Desktop installed locally
- GitHub account with your repository
- Render account (render.com)
- Vercel account (vercel.com)
- Neon database account (neon.tech) — already configured

## Local Development with Docker

### 1. Build Docker Images
```bash
# Build backend image
docker build -t driveaway-backend:latest ./backend

# Build frontend image
docker build -t driveaway-frontend:latest ./frontend
```

### 2. Run with Docker Compose
```bash
# Copy environment variables template
cp .env.example .env

# Update .env with your credentials
# Edit DATABASE_URL, SECRET_KEY, SMTP credentials, etc.

# Start both services
docker compose up
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Health Check: http://localhost:8000/api/health
- Database Status: http://localhost:8000/db-status

### 3. Stop Services
```bash
docker compose down
```

---

## Deployment to Render (Backend)

### 1. Prepare Your Repository
Ensure your GitHub repository contains:
- `/backend/Dockerfile` (already included)
- `/backend/.dockerignore` (already included)
- `/backend/requirements.txt` (already included)

### 2. Create Render Service
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name:** `driveaway-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Build Command:** (leave empty, Render uses Dockerfile)
   - **Start Command:** (leave empty, Render uses Dockerfile CMD)

### 3. Configure Environment Variables
In Render dashboard, go to **Environment** and add:
```
DATABASE_URL=postgresql://neondb_owner:your_password@ep-lucky-star-al5bk8tj-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SECRET_KEY=your-very-secure-secret-key-change-this
FRONTEND_URL=https://your-frontend-vercel-url.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### 4. Deploy
- Click **"Deploy"**
- Render will build and deploy automatically
- Your backend URL: `https://driveaway-backend.onrender.com`

### 5. Test Backend Deployment
```bash
curl https://driveaway-backend.onrender.com/api/health
```

---

## Deployment to Vercel (Frontend)

### 1. Prepare Your Repository
Ensure `/frontend` contains:
- `Dockerfile` (already included)
- `.dockerignore` (already included)
- `package.json` with all dependencies (already updated)
- `next.config.js` (already included)

### 2. Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from repository root
vercel --prod
```

Or deploy via GitHub:
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the project root
4. Vercel auto-detects Next.js

### 3. Configure Environment Variables
In Vercel dashboard → **Settings** → **Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://driveaway-backend.onrender.com
```

### 4. Deploy
- Click **"Deploy"**
- Your frontend URL: `https://driveaway.vercel.app` (or custom domain)

### 5. Test Frontend Deployment
Visit your Vercel URL in the browser

---

## Database Configuration (Neon)

Your Neon PostgreSQL is already configured:
- Connection String: `postgresql://neondb_owner:...@ep-lucky-star-al5bk8tj-pooler.c-3.eu-central-1.aws.neon.tech/neondb`
- Use the pooler endpoint for Render deployments (connection pooling required)

---

## Docker Image Specifications

### Backend Image
- **Base:** `python:3.11-slim`
- **Multi-stage build:** Reduces size by separating build and runtime
- **Size:** ~435MB
- **Port:** 8000
- **Framework:** FastAPI with Uvicorn
- **Database:** AsyncPG driver for PostgreSQL

### Frontend Image
- **Base:** `node:20-alpine`
- **Multi-stage build:** Separates builder from runtime
- **Size:** ~1.34GB (includes Next.js production build)
- **Port:** 3000
- **Framework:** Next.js 16+ with TypeScript

---

## Dockerfile Details

### Backend (Python/FastAPI)
```dockerfile
# Multi-stage: builder stage installs dependencies
# Final stage copies only production dependencies
# Health check enabled
# Runs: uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend (Node/Next.js)
```dockerfile
# Multi-stage: builder stage runs npm install + npm build
# Final stage contains only production dependencies
# Health check enabled
# Runs: npm start (Next.js production server)
```

---

## Important Notes

### Backend Deployment
- The backend runs in production mode (no reload)
- Ensure all environment variables are set correctly
- Database migrations run automatically on startup
- CORS is enabled for all origins (restrict in production if needed)

### Frontend Deployment
- Vercel provides automatic SSL/HTTPS
- Builds are optimized with tree-shaking and code splitting
- Set `NEXT_PUBLIC_API_URL` to your backend URL

### Database
- Using Neon connection pooler prevents connection exhaustion
- Set `sslmode=require` for security
- Alembic migrations run on backend startup

---

## Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Verify all environment variables are set
# Test local build: docker build -t driveaway-backend:latest ./backend
```

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set to the correct Render URL
- Check CORS settings in `backend/app/main.py`
- Rebuild frontend with correct environment variable

### Database connection errors
- Verify DATABASE_URL format
- Test connection: `psql "your_database_url"`
- Ensure Neon pooler endpoint is used (pooler.c-3.eu-central-1.aws.neon.tech)

### Image sizes
- Backend is optimized with multi-stage build (~435MB)
- Frontend includes Next.js build artifacts (~1.34GB)
- Both include their respective runtimes and dependencies

---

## Production Checklist

- [ ] Set strong `SECRET_KEY` in Render
- [ ] Restrict CORS origins to your frontend URL
- [ ] Enable HTTPS on both services
- [ ] Configure custom domain names
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable auto-deploy on GitHub push
- [ ] Configure backup strategy for Neon database
- [ ] Test all API endpoints after deployment
- [ ] Monitor logs in Render dashboard

---

## Next Steps

1. Push Dockerfiles to GitHub
2. Create Render Web Service for backend
3. Deploy frontend to Vercel
4. Test all endpoints (health check, db-status)
5. Configure custom domains if needed
