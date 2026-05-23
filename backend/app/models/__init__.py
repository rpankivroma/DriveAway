from app.db.base import Base
from app.models.user import User, VerificationCode
from app.models.car import Car
from app.models.booking import Deal
from app.models.discount import AvailableDiscount
from app.models.service import AdditionalService

__all__ = ["Base", "User", "VerificationCode", "Car", "Deal", "AvailableDiscount", "AdditionalService"]
