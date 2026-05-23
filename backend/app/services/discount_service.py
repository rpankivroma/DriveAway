from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.discount_repository import DiscountRepository
from app.schemas.discount import DiscountResponse
from typing import List

class DiscountService:
    def __init__(self, db: AsyncSession):
        self.discount_repo = DiscountRepository(db)
        self.db = db

    async def get_available_discounts(self) -> List[DiscountResponse]:
        discounts = await self.discount_repo.get_all_ordered()
        return [DiscountResponse.model_validate(d) for d in discounts]
