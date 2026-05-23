from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_
from app.models.car import Car, CarStatusEnum
from app.repositories.base_repository import BaseRepository

class CarRepository(BaseRepository[Car]):
    def __init__(self, db: AsyncSession):
        super().__init__(Car, db)

    async def get_available_cars(self, filters: dict = None, skip: int = 0, limit: int = 10) -> List[Car]:
        query = select(Car).where(Car.status == CarStatusEnum.available)
        
        if filters:
            if filters.get("min_price"):
                query = query.where(Car.price_per_day >= filters["min_price"])
            if filters.get("max_price"):
                query = query.where(Car.price_per_day <= filters["max_price"])
            if filters.get("transmission"):
                query = query.where(Car.transmission.in_(filters["transmission"]))
            if filters.get("fuel_type"):
                query = query.where(Car.fuel_type.in_(filters["fuel_type"]))
            if filters.get("passengers"):
                query = query.where(Car.passengers.in_(filters["passengers"]))
            if filters.get("luggage"):
                query = query.where(Car.luggage.in_(filters["luggage"]))
            if filters.get("category"):
                query = query.where(Car.category.in_(filters["category"]))
            if filters.get("features"):
                for feature in filters["features"]:
                    query = query.where(Car.features.ilike(f"%{feature}%"))

        if filters and filters.get("sort"):
            if filters["sort"] == "price_low":
                query = query.order_by(Car.price_per_day.asc())
            elif filters["sort"] == "price_high":
                query = query.order_by(Car.price_per_day.desc())
            else:
                query = query.order_by(Car.id.asc())
        else:
            query = query.order_by(Car.id.asc())

        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()

    async def count_available_cars(self, filters: dict = None) -> int:
        query = select(func.count(Car.id)).where(Car.status == CarStatusEnum.available)
        
        if filters:
            if filters.get("min_price"):
                query = query.where(Car.price_per_day >= filters["min_price"])
            if filters.get("max_price"):
                query = query.where(Car.price_per_day <= filters["max_price"])
            if filters.get("transmission"):
                query = query.where(Car.transmission.in_(filters["transmission"]))
            if filters.get("fuel_type"):
                query = query.where(Car.fuel_type.in_(filters["fuel_type"]))
            if filters.get("passengers"):
                query = query.where(Car.passengers.in_(filters["passengers"]))
            if filters.get("luggage"):
                query = query.where(Car.luggage.in_(filters["luggage"]))
            if filters.get("category"):
                query = query.where(Car.category.in_(filters["category"]))
            if filters.get("features"):
                for feature in filters["features"]:
                    query = query.where(Car.features.ilike(f"%{feature}%"))

        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_by_license_plate(self, license_plate: str) -> Optional[Car]:
        result = await self.db.execute(select(Car).where(Car.license_plate == license_plate))
        return result.scalars().first()

    async def get_all_brands(self) -> List[str]:
        query = select(Car.brand).distinct().where(Car.status == CarStatusEnum.available)
        result = await self.db.execute(query)
        return [row[0] for row in result.all()]

    async def get_all_categories(self) -> List[str]:
        query = select(Car.category).distinct().where(Car.status == CarStatusEnum.available)
        result = await self.db.execute(query)
        return [row[0] for row in result.all()]
