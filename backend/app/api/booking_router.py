from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import BookingService

router = APIRouter(tags=["bookings"])

@router.post("", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    booking_service = BookingService(db)
    return await booking_service.create_booking(user, booking_data)

@router.get("", response_model=List[BookingResponse])
async def get_user_bookings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    booking_service = BookingService(db)
    return await booking_service.get_user_bookings(user.id)

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_by_id(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    booking_service = BookingService(db)
    return await booking_service.get_booking_by_id(booking_id, user.id)

@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    booking_service = BookingService(db)
    return await booking_service.cancel_booking(booking_id, user.id)

@router.post("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    booking_service = BookingService(db)
    return await booking_service.confirm_booking(booking_id, user.id)
