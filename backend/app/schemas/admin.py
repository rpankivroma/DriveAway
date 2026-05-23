from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .booking import AdminBookingResponse

class DashboardStats(BaseModel):
    total_revenue: float
    total_bookings: int
    total_cars: int
    total_users: int
    monthly_revenue: float
    available_cars: int
    active_customers: int
    revenue_trend: List[dict]
    bookings_trend: List[dict]
    fleet_by_category: List[dict]

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    bookings_count: int
    total_spent: float
    member_since: datetime

class CustomerDetailResponse(CustomerResponse):
    phone: Optional[str]
    address: Optional[str]
    drivers_license: Optional[str]
    booking_history: List[AdminBookingResponse]

class SettingsUpdate(BaseModel):
    business_name: str
    business_email: str
    business_phone: str
    business_address: str

class AdminChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str
