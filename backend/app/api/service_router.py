from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.service_service import ServiceService
from app.schemas.service import ServiceResponse

router = APIRouter(tags=["services"])

@router.get("", response_model=List[ServiceResponse])
async def get_services(db: AsyncSession = Depends(get_db)):
    service_service = ServiceService(db)
    return await service_service.get_services()
