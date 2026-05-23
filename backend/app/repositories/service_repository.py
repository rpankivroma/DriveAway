from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.service import AdditionalService
from app.repositories.base_repository import BaseRepository

class ServiceRepository(BaseRepository[AdditionalService]):
    def __init__(self, db: AsyncSession):
        super().__init__(AdditionalService, db)

    async def get_all_ordered(self) -> List[AdditionalService]:
        result = await self.db.execute(select(AdditionalService).order_by(AdditionalService.name))
        return result.scalars().all()
