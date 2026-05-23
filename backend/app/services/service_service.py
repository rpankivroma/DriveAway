from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.service_repository import ServiceRepository

class ServiceService:
    def __init__(self, db: AsyncSession):
        self.service_repo = ServiceRepository(db)
        self.db = db

    async def get_services(self):
        return await self.service_repo.get_all_ordered()
