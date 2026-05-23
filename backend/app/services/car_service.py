from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.car_repository import CarRepository
from app.models.car import TransmissionEnum, FuelTypeEnum, CarStatusEnum

class CarService:
    def __init__(self, db: AsyncSession):
        self.car_repo = CarRepository(db)
        self.db = db

    async def get_cars(self, filters: dict, page: int, page_size: int):
        skip = (page - 1) * page_size
        
        # Process filter lists
        if filters.get("transmission"):
            filters["transmission"] = [TransmissionEnum(t) for t in filters["transmission"].split(",")]
        if filters.get("fuel_type"):
            filters["fuel_type"] = [FuelTypeEnum(f) for f in filters["fuel_type"].split(",")]
        if filters.get("passengers"):
            filters["passengers"] = [int(p) for p in filters["passengers"].split(",")]
        if filters.get("luggage"):
            filters["luggage"] = [int(l) for l in filters["luggage"].split(",")]
        if filters.get("features"):
            filters["features"] = filters["features"].split(",")
        if filters.get("category"):
            filters["category"] = filters["category"].split(",")

        cars = await self.car_repo.get_available_cars(filters, skip, page_size)
        total_items = await self.car_repo.count_available_cars(filters)
        total_pages = max((total_items + page_size - 1) // page_size, 1)

        items = []
        for car in cars:
            features_list = []
            if car.features:
                features_list = [f.strip() for f in car.features.split(",")]

            items.append({
                "id": car.id,
                "make": car.brand,
                "model": car.model,
                "year": car.year,
                "license_plate": car.license_plate,
                "color": car.color,
                "category": car.category,
                "price_per_day": float(car.price_per_day),
                "image_url": car.images or "https://picsum.photos/seed/car/800/600",
                "passengers": car.passengers,
                "luggage": car.luggage,
                "transmission": car.transmission.value if hasattr(car.transmission, 'value') else car.transmission,
                "fuel_type": car.fuel_type.value if hasattr(car.fuel_type, 'value') else car.fuel_type,
                "features": features_list,
                "description": car.description,
                "is_available": car.status == CarStatusEnum.available,
                "created_at": car.created_at,
                "updated_at": car.updated_at
            })

        return {
            "items": items,
            "total_pages": total_pages,
            "total_items": total_items
        }

    async def get_car_by_id(self, car_id: int):
        car = await self.car_repo.get(car_id)
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")
        
        features_list = []
        if car.features:
            features_list = [f.strip() for f in car.features.split(",")]

        return {
            "id": car.id,
            "make": car.brand,
            "model": car.model,
            "year": car.year,
            "license_plate": car.license_plate,
            "color": car.color,
            "passengers": car.passengers,
            "luggage": car.luggage,
            "transmission": car.transmission.value if hasattr(car.transmission, 'value') else car.transmission,
            "fuel_type": car.fuel_type.value if hasattr(car.fuel_type, 'value') else car.fuel_type,
            "features": features_list,
            "description": car.description,
            "image_url": car.images,
            "price_per_day": float(car.price_per_day),
            "is_available": car.status == CarStatusEnum.available,
            "bookings_count": 0,
            "created_at": car.created_at,
            "updated_at": car.updated_at
        }

    async def get_brands(self):
        return await self.car_repo.get_all_brands()

    async def get_categories(self):
        return await self.car_repo.get_all_categories()
