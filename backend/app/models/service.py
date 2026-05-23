from sqlalchemy import Column, BigInteger, String, Text, Numeric, TIMESTAMP
from sqlalchemy.sql import func
from app.db.base import Base

class AdditionalService(Base):
    __tablename__ = "additional_services"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    icon = Column(String(50), nullable=False) # Store lucide icon name
    name = Column(String(100), nullable=False)
    desc = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
