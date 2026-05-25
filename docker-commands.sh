#!/bin/bash
# DriveAway Container Run Commands
# Use these to test containers locally or deploy manually

# =====================================================
# LOCAL TESTING - Run containers individually
# =====================================================

# Test Backend Container (requires DATABASE_URL env var)
docker run -d \
  --name driveaway-backend-test \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://neondb_owner:npg_Do4M2nuFXrhx@ep-lucky-star-al5bk8tj-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" \
  -e SECRET_KEY="test-secret-key" \
  -e FRONTEND_URL="http://localhost:3000" \
  driveaway-backend:latest

# Test Frontend Container
docker run -d \
  --name driveaway-frontend-test \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  driveaway-frontend:latest

# =====================================================
# CHECK LOGS
# =====================================================

docker logs driveaway-backend-test
docker logs driveaway-frontend-test

# =====================================================
# STOP CONTAINERS
# =====================================================

docker stop driveaway-backend-test driveaway-frontend-test
docker rm driveaway-backend-test driveaway-frontend-test

# =====================================================
# DOCKER COMPOSE (Recommended for local dev)
# =====================================================

# Start all services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# =====================================================
# BUILD COMMANDS
# =====================================================

# Rebuild backend without cache
docker build --no-cache -t driveaway-backend:latest ./backend

# Rebuild frontend without cache
docker build --no-cache -t driveaway-frontend:latest ./frontend

# Build with specific tag for deployment
docker build -t driveaway-backend:v1.0.0 ./backend
docker build -t driveaway-frontend:v1.0.0 ./frontend

# =====================================================
# IMAGE INSPECTION
# =====================================================

# List all DriveAway images
docker images | grep driveaway

# Get image details
docker inspect driveaway-backend:latest
docker inspect driveaway-frontend:latest

# Show image history (layers)
docker history driveaway-backend:latest
docker history driveaway-frontend:latest

# =====================================================
# RENDER DEPLOYMENT (if pushing manually)
# =====================================================

# Tag for Render registry
docker tag driveaway-backend:latest render.com/driveaway-backend:latest
docker tag driveaway-frontend:latest render.com/driveaway-frontend:latest

# Note: Render auto-builds from Dockerfile in GitHub
# Manual pushing not required for standard deployment

# =====================================================
# CLEAN UP
# =====================================================

# Remove containers
docker ps -a | grep driveaway | awk '{print $1}' | xargs docker rm -f

# Remove images
docker rmi driveaway-backend:latest driveaway-frontend:latest

# Full cleanup (removes all unused volumes/networks)
docker system prune -a --volumes
