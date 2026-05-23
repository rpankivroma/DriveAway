from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.discount_service import DiscountService
from app.schemas.discount import DiscountResponse

router = APIRouter(tags=["discounts"])

@router.get("", response_model=List[DiscountResponse])
async def get_discounts(db: AsyncSession = Depends(get_db)):
    discount_service = DiscountService(db)
    return await discount_service.get_available_discounts()
