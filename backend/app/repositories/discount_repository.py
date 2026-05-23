from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.discount import AvailableDiscount
from app.repositories.base_repository import BaseRepository

class DiscountRepository(BaseRepository[AvailableDiscount]):
    def __init__(self, db: AsyncSession):
        super().__init__(AvailableDiscount, db)

    async def get_all_ordered(self) -> List[AvailableDiscount]:
        result = await self.db.execute(select(AvailableDiscount).order_by(AvailableDiscount.min_days))
        return result.scalars().all()
