from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from datetime import datetime, timezone
import re

class CardBase(BaseModel):
    card_number: str
    expires: str # MM/YY

    @field_validator('card_number')
    @classmethod
    def validate_card_number(cls, v):
        if not re.match(r'^\d{16}$', v):
            raise ValueError('Card number must be exactly 16 digits')
        return v

    @field_validator('expires')
    @classmethod
    def validate_expires(cls, v):
        if not re.match(r'^(0[1-9]|1[0-2])\/\d{2}$', v):
            raise ValueError('Expiration date must be in MM/YY format')
        
        # Check if expired
        month, year = map(int, v.split('/'))
        year += 2000 # Assume 21st century
        
        now = datetime.now(timezone.utc)
        if year < now.year or (year == now.year and month < now.month):
            raise ValueError('Card has expired')
            
        return v

class CardCreate(CardBase):
    pass

class CardResponse(CardBase):
    id: int
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    drivers_license: Optional[str] = None
    address: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserStats(BaseModel):
    total_deals: int
    active_deals: int
    total_spent: float
    reward_points: int

class UserMeResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    drivers_license: Optional[str]
    address: Optional[str]
    created_at: datetime
    cards: List[CardResponse]
    stats: UserStats
    booking_history: List[dict]

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserResponse(UserBase):
    id: int
    role: str
    is_verified: int
    created_at: datetime

    class Config:
        from_attributes = True
