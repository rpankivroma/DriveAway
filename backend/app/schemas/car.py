from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Union
from decimal import Decimal
from datetime import datetime

class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    license_plate: str
    color: Optional[str] = None
    passengers: int = 5
    luggage: int = 2
    transmission: str
    fuel_type: str
    category: Optional[str] = None
    features: Optional[Union[str, List[str]]] = None
    description: Optional[str] = None
    images: Optional[str] = None
    price_per_day: Decimal
    status: str

    @field_validator('features')
    @classmethod
    def validate_features(cls, v):
        if isinstance(v, list):
            return ", ".join(v)
        return v

class CarCreate(CarBase):
    pass

class CarUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: Optional[str] = None
    color: Optional[str] = None
    passengers: Optional[int] = None
    luggage: Optional[int] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    category: Optional[str] = None
    features: Optional[Union[str, List[str]]] = None
    description: Optional[str] = None
    images: Optional[str] = None
    price_per_day: Optional[Decimal] = None
    status: Optional[str] = None

    @field_validator('features')
    @classmethod
    def validate_features(cls, v):
        if isinstance(v, list):
            return ", ".join(v)
        return v

class CarResponse(BaseModel):
    id: int
    make: str
    model: str
    year: int
    license_plate: str
    color: Optional[str] = None
    passengers: int
    luggage: int
    transmission: str
    fuel_type: str
    category: Optional[str] = None
    features: List[str] = []
    description: Optional[str] = None
    image_url: Optional[str] = None
    price_per_day: float
    is_available: bool
    bookings_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
