# Deployment URLs & Next Steps

## 📱 Local Testing

**Backend:**
```
http://localhost:8000
http://localhost:8000/api/health
http://localhost:8000/db-status
```

**Frontend:**
```
http://localhost:3000
```

**Test with:**
```bash
docker compose up
curl http://localhost:8000/api/health
```

---

## 🚀 Production URLs (After Deployment)

### Backend (Render)
```
URL: https://driveaway-backend.onrender.com
Health: https://driveaway-backend.onrender.com/api/health
DB Status: https://driveaway-backend.onrender.com/db-status
```

### Frontend (Vercel)
```
URL: https://driveaway.vercel.app
(Or your custom domain)
```

### Database (Neon)
```
Host: ep-lucky-star-al5bk8tj-pooler.c-3.eu-central-1.aws.neon.tech
Database: neondb
Port: 5432
Connection: postgresql://neondb_owner:...@ep-lucky-star-al5bk8tj-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🎯 Immediate Next Steps

### Step 1: Push Code to GitHub
```bash
cd /path/to/DriveAway
git add .
git commit -m "Add Docker configuration for Render/Vercel deployment"
git push origin main
```

### Step 2: Deploy Backend to Render
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (rpankivroma/DriveAway)
4. **Configuration:**
   - Name: `driveaway-backend`
   - Root Directory: `backend`
   - Runtime: Docker
5. Click **"Create Web Service"**
6. In Environment tab, add:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_Do4M2nuFXrhx@ep-lucky-star-al5bk8tj-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   SECRET_KEY=choose-a-strong-secret-key-here-minimum-32-chars
   FRONTEND_URL=https://driveaway.vercel.app (update after Vercel deploy)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=pankiv.roma@gmail.com
   SMTP_PASS=ynku hrfu hzui egcm
   ```
7. Click **"Deploy"** (wait 3-5 minutes)
8. Save your backend URL: `https://driveaway-backend-xxxxx.onrender.com`

### Step 3: Deploy Frontend to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Project Settings:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `frontend`
4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://driveaway-backend-xxxxx.onrender.com
   ```
   (Use the URL from Step 2)
5. Click **"Deploy"** (wait 1-2 minutes)
6. Save your frontend URL: `https://driveaway-xxxxxx.vercel.app`

### Step 4: Update Render Backend with Vercel URL
1. Go back to Render backend service
2. In Environment tab, update:
   ```
   FRONTEND_URL=https://driveaway-xxxxxx.vercel.app
   ```
3. Redeploy (Render auto-redeploys on env change)

---

## ✅ Verification After Deployment

### Test Backend Connectivity
```bash
# Health check
curl https://driveaway-backend-xxxxx.onrender.com/api/health

# Expected response:
# {"status":"ok","message":"Backend is reachable"}

# Database check
curl https://driveaway-backend-xxxxx.onrender.com/db-status

# Expected response:
# {"status":"success","message":"Database connection is healthy","db":"MySQL"}
```

### Test Frontend Connectivity
1. Open in browser: `https://driveaway-xxxxxx.vercel.app`
2. Should load without errors
3. Check browser console (F12) for any API errors

### Monitor Logs
**Backend (Render):**
1. Go to https://render.com/dashboard
2. Click `driveaway-backend` service
3. Go to **Logs** tab
4. Should see: `Application startup complete`

**Frontend (Vercel):**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Deployments** → **Functions/Logs**

---

## 📋 Environment Variables Reference

### Required for Backend (Render)
| Variable | Value | Notes |
|----------|-------|-------|
| DATABASE_URL | Your Neon connection string | Must use pooler endpoint |
| SECRET_KEY | Strong random string (32+ chars) | Used for JWT tokens |
| FRONTEND_URL | Your Vercel frontend URL | For CORS |
| SMTP_HOST | smtp.gmail.com | For email |
| SMTP_PORT | 587 | Standard SMTP port |
| SMTP_USER | your-email@gmail.com | Gmail address |
| SMTP_PASS | App-specific password | Not your actual Gmail password |

### Required for Frontend (Vercel)
| Variable | Value | Notes |
|----------|-------|-------|
| NEXT_PUBLIC_API_URL | Your Render backend URL | Used by frontend to call API |

---

## 🔄 Local Development with Docker Compose

While waiting for deployments or for local testing:

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env  # or your favorite editor

# Start all services
docker compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

---

## 🐛 Common Issues & Fixes

### Backend won't start on Render
- Check Render logs for errors
- Verify all environment variables are set
- Test locally: `docker build -t test ./backend && docker run test`

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Rebuild frontend on Vercel (redeploy)
- Check browser console for CORS errors

### Database connection failing
- Verify DATABASE_URL uses pooler endpoint (not direct connection)
- Test connection locally: `psql "your_database_url"`
- Ensure `sslmode=require` is in the connection string

### Port already in use locally
```bash
# Find and kill process using port
lsof -ti:8000 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8000   # Windows
```

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Docker Docs:** https://docs.docker.com
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Next.js Docs:** https://nextjs.org/docs

---

## 📊 Deployment Timeline

| Step | Time | Service |
|------|------|---------|
| Push to GitHub | 1 min | GitHub |
| Deploy Backend | 3-5 min | Render |
| Deploy Frontend | 1-2 min | Vercel |
| Total | ~10 min | - |

---

## 🎉 Success Indicators

✅ All of the following should be true:

- [ ] Backend URL responds to health check
- [ ] Frontend loads in browser without errors
- [ ] Frontend can communicate with backend API
- [ ] Database connection is healthy
- [ ] No CORS errors in browser console
- [ ] All API endpoints are accessible

---

**You're ready to deploy! Follow the steps above and your application will be live in ~10 minutes.** 🚀
