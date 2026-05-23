from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.database import get_db
from app.services.car_service import CarService

router = APIRouter(tags=["cars"])

@router.get("")
async def get_cars(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(6, ge=1),
    sort: str = Query("recommended"),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    transmission: Optional[str] = None,
    fuel_type: Optional[str] = None,
    passengers: Optional[str] = None,
    luggage: Optional[str] = None,
    features: Optional[str] = None,
    category: Optional[str] = None
):
    filters = {
        "sort": sort,
        "min_price": min_price,
        "max_price": max_price,
        "transmission": transmission,
        "fuel_type": fuel_type,
        "passengers": passengers,
        "luggage": luggage,
        "features": features,
        "category": category
    }
    car_service = CarService(db)
    return await car_service.get_cars(filters, page, page_size)

@router.get("/makes")
async def get_makes(db: AsyncSession = Depends(get_db)):
    car_service = CarService(db)
    return await car_service.get_brands()

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    car_service = CarService(db)
    return await car_service.get_categories()

@router.get("/{car_id}")
async def get_car_by_id(car_id: int, db: AsyncSession = Depends(get_db)):
    car_service = CarService(db)
    return await car_service.get_car_by_id(car_id)
