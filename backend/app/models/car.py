import enum
from sqlalchemy import Column, BigInteger, String, SmallInteger, Integer, Text, Numeric, Enum, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class TransmissionEnum(str, enum.Enum):
    automatic = 'automatic'
    mechanic = 'mechanic'

class FuelTypeEnum(str, enum.Enum):
    gasoline = 'gasoline'
    gas = 'gas'
    electricity = 'electricity'

class CarStatusEnum(str, enum.Enum):
    available = 'available'
    reserved = 'reserved'
    in_service = 'in_service'
    inactive = 'inactive'

class Car(Base):
    __tablename__ = "cars"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(SmallInteger, nullable=False)
    license_plate = Column(String(20), nullable=False, unique=True)
    color = Column(String(50), nullable=True)
    passengers = Column(Integer, default=5)
    luggage = Column(Integer, default=2)
    transmission = Column(Enum(TransmissionEnum), nullable=False)
    fuel_type = Column(Enum(FuelTypeEnum), nullable=False)
    category = Column(String(50), nullable=True)
    features = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    images = Column(Text, nullable=True)
    price_per_day = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(CarStatusEnum), default=CarStatusEnum.available)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)

    deals = relationship("Deal", back_populates="car")
