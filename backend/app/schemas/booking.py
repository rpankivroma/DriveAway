from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from typing import Optional, Any
from decimal import Decimal
from datetime import datetime


class BookingBase(BaseModel):
    car_id: int
    start_time: datetime
    end_time: datetime
    total_price: Decimal
    pick_up_location: Optional[str] = None
    additional_services: Optional[str] = None
    status: str = "pending"

    @field_validator('total_price')
    @classmethod
    def total_price_must_be_positive(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError('Total price cannot be negative')
        return v

    @model_validator(mode='after')
    def check_dates(self) -> 'BookingBase':
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError('End time must be after start time')
        return self


class BookingCreate(BaseModel):
    car_id: int
    start_time: datetime
    end_time: datetime
    pick_up_location: str
    additional_services: Optional[list] = None

    @model_validator(mode='after')
    def check_dates(self) -> 'BookingCreate':
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError('End time must be after start time')
        return self


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    total_price: Optional[Decimal] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    car_id: int
    start_time: datetime
    end_time: datetime
    total_price: Decimal
    pick_up_location: Optional[str] = None
    additional_services: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminBookingResponse(BaseModel):
    id: int
    customer_name: str
    car_name: str
    start_date: datetime
    end_date: datetime
    status: str
    total_price: float
