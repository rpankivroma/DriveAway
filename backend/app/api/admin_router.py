from fastapi import APIRouter, Depends, status, Query, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.database import get_db
from app.core.dependencies import get_admin_user
from app.models.user import User
from app.models.booking import DealStatusEnum
from app.services.admin_service import AdminService
from app.schemas.admin import DashboardStats, CustomerResponse, CustomerDetailResponse, SettingsUpdate, AdminChangePasswordRequest
from app.schemas.car import CarResponse, CarCreate, CarUpdate
from app.schemas.booking import AdminBookingResponse
from app.schemas.discount import DiscountResponse, DiscountCreate
from app.schemas.service import ServiceResponse, ServiceCreate

router = APIRouter(tags=["admin"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.get_dashboard_stats()

@router.get("/cars", response_model=List[CarResponse])
async def get_admin_cars(db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.get_cars()

@router.post("/cars", response_model=CarResponse)
async def create_car(car_data: CarCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.create_car(car_data)

@router.put("/cars/{car_id}", response_model=CarResponse)
async def update_car(car_id: int, car_data: CarUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.update_car(car_id, car_data)

@router.delete("/cars/{car_id}")
async def delete_car(car_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.delete_car(car_id)

@router.post("/cars/upload")
async def upload_car_photo(file: UploadFile = File(...), db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.upload_car_photo(file)

@router.get("/bookings", response_model=List[AdminBookingResponse])
async def get_admin_bookings(
    status: Optional[DealStatusEnum] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    admin_service = AdminService(db)
    return await admin_service.get_bookings(status, search)

@router.post("/bookings/{booking_id}/dispute")
async def dispute_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    admin_service = AdminService(db)
    return await admin_service.dispute_booking(booking_id)

@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    admin_service = AdminService(db)
    return await admin_service.cancel_booking(booking_id)

@router.get("/users", response_model=List[CustomerResponse])
async def get_admin_users(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    admin_service = AdminService(db)
    return await admin_service.get_customers(search)

@router.get("/users/{user_id}", response_model=CustomerDetailResponse)
async def get_customer_detail(user_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.get_customer_detail(user_id)

@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.get_settings(admin)

@router.post("/settings")
async def update_settings(settings_data: SettingsUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.update_settings(admin, settings_data)

@router.post("/change-password")
async def change_password(data: AdminChangePasswordRequest, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.change_password(admin, data)

@router.get("/discounts", response_model=List[DiscountResponse])
async def get_discounts(db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.get_discounts()

@router.post("/discounts", response_model=DiscountResponse)
async def create_discount(data: DiscountCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.create_discount(data)

@router.put("/discounts/{discount_id}", response_model=DiscountResponse)
async def update_discount(discount_id: int, data: DiscountCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.update_discount(discount_id, data)

@router.delete("/discounts/{discount_id}")
async def delete_discount(discount_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.delete_discount(discount_id)

@router.get("/services", response_model=List[ServiceResponse])
async def get_services(db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.get_services()

@router.post("/services", response_model=ServiceResponse)
async def create_service(data: ServiceCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.create_service(data)

@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(service_id: int, data: ServiceCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.update_service(service_id, data)

@router.delete("/services/{service_id}")
async def delete_service(service_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_admin_user)):
    admin_service = AdminService(db)
    return await admin_service.delete_service(service_id)
