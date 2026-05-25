# DriveAway Docker Quick Reference

## Images Built
- **Backend:** `driveaway-backend:latest` (435MB)
  - FastAPI + Uvicorn
  - Python 3.11.15
  - Port: 8000

- **Frontend:** `driveaway-frontend:latest` (1.34GB)
  - Next.js 16.2+ with TypeScript
  - Node 20.20.2
  - Port: 3000

## Quick Start (Local Development)

```bash
# 1. Build images
docker build -t driveaway-backend:latest ./backend
docker build -t driveaway-frontend:latest ./frontend

# 2. Run with docker-compose
docker compose up

# 3. Test endpoints
curl http://localhost:8000/api/health
open http://localhost:3000
```

## Deploy Backend to Render

1. Push to GitHub
2. Render → New Web Service
3. Select repository, root directory: `backend`
4. Set environment variables (DATABASE_URL, SECRET_KEY, etc.)
5. Deploy (auto-builds from Dockerfile)

## Deploy Frontend to Vercel

1. Push to GitHub
2. Vercel → New Project
3. Import repository
4. Set environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy (auto-detects Next.js)

## Environment Variables

**Backend (.env or Render):**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `SECRET_KEY` - JWT secret for authentication
- `FRONTEND_URL` - Your Vercel frontend URL
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email config

**Frontend (.env.local or Vercel):**
- `NEXT_PUBLIC_API_URL` - Your Render backend URL

## Dockerfile Locations
- Backend: `/backend/Dockerfile`
- Frontend: `/frontend/Dockerfile`
- Both include `.dockerignore` for optimized builds

## Troubleshooting

**Build fails locally:**
```bash
docker build --no-cache -t driveaway-backend:latest ./backend
```

**Container won't start:**
```bash
docker logs <container_id>
```

**Clean everything:**
```bash
docker compose down -v
docker system prune -a
```

## Deployed URLs
- Backend: `https://driveaway-backend.onrender.com`
- Frontend: `https://driveaway.vercel.app`
- API: `https://driveaway-backend.onrender.com/api/health`
- Database: Neon (`postgresql://...@ep-lucky-star-al5bk8tj-pooler.c-3.eu-central-1.aws.neon.tech/neondb`)
