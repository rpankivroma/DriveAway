import enum
from sqlalchemy import Column, BigInteger, String, Numeric, Enum, TIMESTAMP, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class DealStatusEnum(str, enum.Enum):
    pending = 'pending'
    confirmed = 'confirmed'
    active = 'active'
    completed = 'completed'
    cancelled = 'cancelled'
    disputed = 'disputed'

class Deal(Base):
    __tablename__ = "deals"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    car_id = Column(BigInteger, ForeignKey("cars.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    pick_up_location = Column(String(255), nullable=True)
    additional_services = Column(Text, nullable=True) # Text was used in models.py
    status = Column(Enum(DealStatusEnum), default=DealStatusEnum.pending)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)

    user = relationship("User", back_populates="deals")
    car = relationship("Car", back_populates="deals")
