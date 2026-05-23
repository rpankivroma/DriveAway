from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import os
from dotenv import load_dotenv

from app.db.database import get_db, engine
from app.db.base import Base
import app.models.user
import app.models.car
import app.models.booking
import app.models.service
import app.models.discount
import alembic.config
import alembic.command
from app.api.auth_router import router as auth_router
from app.api.admin_router import router as admin_router
from app.api.user_router import router as user_router
from app.api.car_router import router as car_router
from app.api.service_router import router as service_router
from app.api.booking_router import router as booking_router
from app.api.discount_router import router as discount_router

load_dotenv()

app = FastAPI(title="Car Sharing API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(user_router, prefix="/api/users")
app.include_router(car_router, prefix="/api/cars")
app.include_router(car_router, prefix="/api/catalog")
app.include_router(service_router, prefix="/api/services")
app.include_router(booking_router, prefix="/api/bookings")
app.include_router(discount_router, prefix="/api/discounts")

@app.on_event("startup")
async def on_startup():
    # Run migrations
    try:
        # For async engine, we might need a different approach if we want to use alembic directly
        # But for now, let's just ensure tables are created if alembic is not running
        # In a real production app, we'd run `alembic upgrade head` before starting the app
        
        # Since we are in a dev environment, we can try to run alembic via shell if possible
        # or just use sqlalchemy to create tables for now to be safe
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables created/verified")
    except Exception as e:
        print(f"Error during startup: {e}")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is reachable"}

@app.get("/db-status")
async def db_status(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT 1"))
        row = result.fetchone()
        if row and row[0] == 1:
            return {"status": "success", "message": "Database connection is healthy", "db": "MySQL"}
        raise HTTPException(status_code=500, detail="Database test query failed")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
