import os
import shutil
import uuid
from typing import Optional
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_, or_, desc, select
from app.repositories.user_repository import UserRepository
from app.repositories.car_repository import CarRepository
from app.repositories.booking_repository import BookingRepository
from app.repositories.discount_repository import DiscountRepository
from app.repositories.service_repository import ServiceRepository
from app.models.user import User, RoleEnum
from app.models.car import Car, CarStatusEnum
from app.models.booking import Deal, DealStatusEnum
from app.models.discount import AvailableDiscount
from app.models.service import AdditionalService
from app.core.security import verify_password, get_password_hash
from app.schemas.admin import SettingsUpdate, AdminChangePasswordRequest
from app.schemas.car import CarCreate, CarUpdate
from app.schemas.discount import DiscountCreate
from app.schemas.service import ServiceCreate

class AdminService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.car_repo = CarRepository(db)
        self.booking_repo = BookingRepository(db)
        self.discount_repo = DiscountRepository(db)
        self.service_repo = ServiceRepository(db)
        self.db = db

    async def get_dashboard_stats(self):
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        
        # Monthly Revenue
        revenue_result = await self.db.execute(
            select(func.sum(Deal.total_price)).where(
                and_(
                    Deal.created_at >= thirty_days_ago,
                    Deal.status.in_([DealStatusEnum.confirmed, DealStatusEnum.active, DealStatusEnum.completed])
                )
            )
        )
        monthly_revenue = float(revenue_result.scalar() or 0)

        # Total Revenue
        total_revenue_result = await self.db.execute(
            select(func.sum(Deal.total_price)).where(
                Deal.status.in_([DealStatusEnum.confirmed, DealStatusEnum.active, DealStatusEnum.completed])
            )
        )
        total_revenue = float(total_revenue_result.scalar() or 0)

        # Total Bookings
        total_bookings = await self.db.execute(select(func.count(Deal.id)))
        total_bookings = total_bookings.scalar() or 0

        # Total Cars
        total_cars_result = await self.db.execute(select(func.count(Car.id)))
        total_cars = total_cars_result.scalar() or 0

        # Available Cars
        available_cars = await self.db.execute(
            select(func.count(Car.id)).where(Car.status == CarStatusEnum.available)
        )
        available_cars = available_cars.scalar() or 0

        # Total Users
        total_users_result = await self.db.execute(
            select(func.count(User.id)).where(User.role == RoleEnum.client)
        )
        total_users = total_users_result.scalar() or 0

        # Active Customers
        active_customers = await self.db.execute(
            select(func.count(func.distinct(Deal.user_id)))
        )
        active_customers = active_customers.scalar() or 0

        # Trends
        revenue_trend = []
        bookings_trend = []
        for i in range(6, -1, -1):
            day = (datetime.now(timezone.utc) - timedelta(days=i)).date()
            next_day = day + timedelta(days=1)
            
            day_rev = await self.db.execute(
                select(func.sum(Deal.total_price)).where(
                    and_(
                        Deal.created_at >= day,
                        Deal.created_at < next_day,
                        Deal.status.in_([DealStatusEnum.confirmed, DealStatusEnum.active, DealStatusEnum.completed])
                    )
                )
            )
            day_bookings = await self.db.execute(
                select(func.count(Deal.id)).where(
                    and_(
                        Deal.created_at >= day,
                        Deal.created_at < next_day
                    )
                )
            )
            revenue_trend.append({"date": day.strftime("%Y-%m-%d"), "value": float(day_rev.scalar() or 0)})
            bookings_trend.append({"date": day.strftime("%Y-%m-%d"), "value": day_bookings.scalar() or 0})

        # Fleet by Category
        fleet_by_cat = await self.db.execute(
            select(Car.category, func.count(Car.id)).group_by(Car.category)
        )
        fleet_by_category = [{"category": row[0] or "Uncategorized", "count": row[1]} for row in fleet_by_cat.all()]

        return {
            "total_revenue": total_revenue,
            "total_bookings": total_bookings,
            "total_cars": total_cars,
            "total_users": total_users,
            "monthly_revenue": monthly_revenue,
            "available_cars": available_cars,
            "active_customers": active_customers,
            "revenue_trend": revenue_trend,
            "bookings_trend": bookings_trend,
            "fleet_by_category": fleet_by_category
        }

    async def get_cars(self):
        cars = await self.car_repo.get_all()
        response = []
        for car in cars:
            bookings_count = await self.db.execute(
                select(func.count(Deal.id)).where(Deal.car_id == car.id)
            )
            response.append({
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
                "category": car.category,
                "features": [f.strip() for f in car.features.split(",")] if car.features else [],
                "description": car.description,
                "image_url": car.images,
                "price_per_day": float(car.price_per_day),
                "is_available": car.status == CarStatusEnum.available,
                "bookings_count": bookings_count.scalar() or 0,
                "created_at": car.created_at,
                "updated_at": car.updated_at
            })
        return response

    async def create_car(self, car_data: CarCreate):
        existing = await self.car_repo.get_by_license_plate(car_data.license_plate)
        if existing:
            raise HTTPException(status_code=400, detail=f"Car with license plate '{car_data.license_plate}' already exists.")
        
        car = await self.car_repo.create(car_data.model_dump())
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
            "category": car.category,
            "features": [f.strip() for f in car.features.split(",")] if car.features else [],
            "description": car.description,
            "image_url": car.images,
            "price_per_day": float(car.price_per_day),
            "is_available": car.status == CarStatusEnum.available,
            "bookings_count": 0,
            "created_at": car.created_at,
            "updated_at": car.updated_at
        }

    async def update_car(self, car_id: int, car_data: CarUpdate):
        car = await self.car_repo.get(car_id)
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")
        
        if car_data.license_plate and car_data.license_plate != car.license_plate:
            existing = await self.car_repo.get_by_license_plate(car_data.license_plate)
            if existing:
                raise HTTPException(status_code=400, detail=f"Car with license plate '{car_data.license_plate}' already exists.")
        
        updated_car = await self.car_repo.update(car, car_data.model_dump(exclude_unset=True))
        bookings_count = await self.db.execute(
            select(func.count(Deal.id)).where(Deal.car_id == updated_car.id)
        )
        return {
            "id": updated_car.id,
            "make": updated_car.brand,
            "model": updated_car.model,
            "year": updated_car.year,
            "license_plate": updated_car.license_plate,
            "color": updated_car.color,
            "passengers": updated_car.passengers,
            "luggage": updated_car.luggage,
            "transmission": updated_car.transmission.value if hasattr(updated_car.transmission, 'value') else updated_car.transmission,
            "fuel_type": updated_car.fuel_type.value if hasattr(updated_car.fuel_type, 'value') else updated_car.fuel_type,
            "category": updated_car.category,
            "features": [f.strip() for f in updated_car.features.split(",")] if updated_car.features else [],
            "description": updated_car.description,
            "image_url": updated_car.images,
            "price_per_day": float(updated_car.price_per_day),
            "is_available": updated_car.status == CarStatusEnum.available,
            "bookings_count": bookings_count.scalar() or 0,
            "created_at": updated_car.created_at,
            "updated_at": updated_car.updated_at
        }

    async def delete_car(self, car_id: int):
        active_bookings = await self.db.execute(
            select(func.count(Deal.id)).where(
                and_(
                    Deal.car_id == car_id,
                    Deal.status.in_([DealStatusEnum.confirmed, DealStatusEnum.active])
                )
            )
        )
        if active_bookings.scalar() > 0:
            raise HTTPException(status_code=400, detail="Cannot delete car with active bookings")
        
        return await self.car_repo.remove(car_id)

    async def upload_car_photo(self, file: UploadFile):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_dir = os.path.join(base_dir, "static", "uploads", "cars")
        os.makedirs(upload_dir, exist_ok=True)
        
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"url": f"/static/uploads/cars/{unique_filename}"}

    async def refresh_booking_statuses(self):
        bookings = await self.booking_repo.get_bookings_for_status_refresh()
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        fifteen_mins_ago = now - timedelta(minutes=15)
        
        for booking in bookings:
            new_status = None
            
            # Ensure datetimes are aware for comparison
            start_time = booking.start_time
            if start_time and start_time.tzinfo is None:
                start_time = start_time.replace(tzinfo=timezone.utc)
                
            end_time = booking.end_time
            if end_time and end_time.tzinfo is None:
                end_time = end_time.replace(tzinfo=timezone.utc)
                
            created_at = booking.created_at
            if created_at and created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            if booking.status == DealStatusEnum.confirmed and start_time <= now and end_time > now:
                new_status = DealStatusEnum.active
            elif booking.status == DealStatusEnum.active and now > end_time:
                new_status = DealStatusEnum.completed
            elif booking.status == DealStatusEnum.pending and created_at < fifteen_mins_ago:
                new_status = DealStatusEnum.cancelled
            
            if new_status:
                await self.booking_repo.update(booking, {"status": new_status})

    async def get_bookings(self, status: Optional[DealStatusEnum] = None, search: Optional[str] = None):
        await self.refresh_booking_statuses()
        deals = await self.booking_repo.get_admin_bookings(status, search)
        return [
            {
                "id": deal.id,
                "customer_name": deal.user.name,
                "car_name": f"{deal.car.brand} {deal.car.model}",
                "start_date": deal.start_time,
                "end_date": deal.end_time,
                "status": deal.status,
                "total_price": float(deal.total_price)
            }
            for deal in deals
        ]

    async def dispute_booking(self, booking_id: int):
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        if booking.status not in [DealStatusEnum.pending, DealStatusEnum.confirmed, DealStatusEnum.active]:
            raise HTTPException(status_code=400, detail="Cannot dispute booking in current status")
            
        return await self.booking_repo.update(booking, {"status": DealStatusEnum.disputed})

    async def cancel_booking(self, booking_id: int):
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        if booking.status not in [DealStatusEnum.pending, DealStatusEnum.confirmed, DealStatusEnum.active]:
            raise HTTPException(status_code=400, detail="Cannot cancel booking in current status")
            
        return await self.booking_repo.update(booking, {"status": DealStatusEnum.cancelled})

    async def get_customers(self, search: Optional[str] = None):
        from sqlalchemy import String
        query = select(User).where(User.role == RoleEnum.client)
        if search:
            query = query.where(or_(User.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
        
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        response = []
        for user in users:
            bookings_count, _, total_spent = await self.booking_repo.get_stats_for_user(user.id)
            response.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "bookings_count": bookings_count,
                "total_spent": float(total_spent),
                "member_since": user.created_at
            })
        return response

    async def get_customer_detail(self, user_id: int):
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        bookings_count, _, total_spent = await self.booking_repo.get_stats_for_user(user.id)
        deals = await self.booking_repo.get_user_bookings(user.id)
        
        booking_history = [
            {
                "id": deal.id,
                "customer_name": user.name,
                "car_name": f"{deal.car.brand} {deal.car.model}",
                "start_date": deal.start_time,
                "end_date": deal.end_time,
                "status": deal.status,
                "total_price": float(deal.total_price)
            }
            for deal in deals
        ]
        
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "drivers_license": user.drivers_license,
            "bookings_count": bookings_count,
            "total_spent": float(total_spent),
            "member_since": user.created_at,
            "booking_history": booking_history
        }

    async def get_settings(self, admin: User):
        return {
            "business_name": admin.name,
            "business_email": admin.email,
            "business_phone": admin.phone or "",
            "business_address": admin.address or ""
        }

    async def update_settings(self, admin: User, data: SettingsUpdate):
        admin.name = data.business_name
        admin.email = data.business_email
        admin.phone = data.business_phone
        admin.address = data.business_address
        await self.db.commit()
        await self.db.refresh(admin)
        return {
            "business_name": admin.name,
            "business_email": admin.email,
            "business_phone": admin.phone or "",
            "business_address": admin.address or ""
        }

    async def change_password(self, admin: User, data: AdminChangePasswordRequest):
        if not verify_password(data.current_password, admin.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect current password")
        if data.new_password != data.confirm_new_password:
            raise HTTPException(status_code=400, detail="New passwords do not match")
        
        admin.password_hash = get_password_hash(data.new_password)
        await self.db.commit()
        return {"status": "success", "message": "Password changed successfully"}

    async def get_discounts(self):
        return await self.discount_repo.get_all_ordered()

    async def create_discount(self, data: DiscountCreate):
        if data.min_days >= data.max_days:
            raise HTTPException(status_code=400, detail="min_days must be less than max_days")
        return await self.discount_repo.create(data.model_dump())

    async def update_discount(self, discount_id: int, data: DiscountCreate):
        if data.min_days >= data.max_days:
            raise HTTPException(status_code=400, detail="min_days must be less than max_days")
        discount = await self.discount_repo.get(discount_id)
        if not discount:
            raise HTTPException(status_code=404, detail="Discount not found")
        return await self.discount_repo.update(discount, data.model_dump())

    async def delete_discount(self, discount_id: int):
        return await self.discount_repo.remove(discount_id)

    async def get_services(self):
        return await self.service_repo.get_all_ordered()

    async def create_service(self, data: ServiceCreate):
        return await self.service_repo.create(data.model_dump())

    async def update_service(self, service_id: int, data: ServiceCreate):
        service = await self.service_repo.get(service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        return await self.service_repo.update(service, data.model_dump())

    async def delete_service(self, service_id: int):
        return await self.service_repo.remove(service_id)
