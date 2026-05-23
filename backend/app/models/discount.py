from sqlalchemy import Column, BigInteger, Integer, Numeric, TIMESTAMP
from sqlalchemy.sql import func
from app.db.base import Base

class AvailableDiscount(Base):
    __tablename__ = "available_discounts"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    min_days = Column(Integer, nullable=False)
    max_days = Column(Integer, nullable=True)
    discount_percent = Column(Numeric(5, 2), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
