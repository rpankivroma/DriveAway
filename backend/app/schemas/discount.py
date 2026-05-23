from pydantic import BaseModel, ConfigDict, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional

class DiscountBase(BaseModel):
    min_days: int
    max_days: Optional[int] = None
    discount_percent: Decimal

    @field_validator('discount_percent')
    @classmethod
    def validate_discount_percent(cls, v):
        if v <= 0:
            raise ValueError('discount_percent must be greater than 0')
        return v

    @field_validator('min_days')
    @classmethod
    def validate_min_days(cls, v):
        if v < 1:
            raise ValueError('min_days must be at least 1')
        return v

    @field_validator('max_days')
    @classmethod
    def validate_max_days(cls, v, info):
        min_days = info.data.get('min_days')
        if v is not None and min_days is not None and v <= min_days:
            raise ValueError('max_days must be greater than min_days')
        return v

class DiscountCreate(DiscountBase):
    pass

class DiscountResponse(DiscountBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
