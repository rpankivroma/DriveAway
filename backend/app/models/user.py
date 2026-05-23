import enum
from sqlalchemy import Column, BigInteger, String, SmallInteger, TIMESTAMP, Enum, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class RoleEnum(str, enum.Enum):
    client = 'client'
    admin = 'admin'

class VerificationTypeEnum(str, enum.Enum):
    reset_password = 'reset_password'
    verify_email = 'verify_email'

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.client)
    phone = Column(String(30), nullable=True)
    drivers_license = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    is_verified = Column(SmallInteger, default=0, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)

    deals = relationship("Deal", back_populates="user", cascade="all, delete-orphan")
    cards = relationship("Card", back_populates="user", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    card_number = Column(String(50), nullable=False)
    expires = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), nullable=False)

    user = relationship("User", back_populates="cards")

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    email = Column(String(150), nullable=False, index=True)
    type = Column(Enum(VerificationTypeEnum), nullable=False)
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(SmallInteger, default=0, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.current_timestamp(), nullable=False)
