from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_
from app.models.user import User, VerificationCode, VerificationTypeEnum
from app.repositories.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_verification_code(self, email: str, type: VerificationTypeEnum) -> Optional[VerificationCode]:
        result = await self.db.execute(
            select(VerificationCode)
            .where(VerificationCode.email == email)
            .where(VerificationCode.type == type)
            .where(VerificationCode.is_used == 0)
            .order_by(VerificationCode.created_at.desc())
        )
        return result.scalars().first()

    async def create_verification_code(self, verification_code: VerificationCode):
        self.db.add(verification_code)
        await self.db.commit()
        await self.db.refresh(verification_code)
        return verification_code

    async def invalidate_previous_codes(self, email: str, type: VerificationTypeEnum):
        from sqlalchemy import update
        await self.db.execute(
            update(VerificationCode)
            .where(VerificationCode.email == email)
            .where(VerificationCode.type == type)
            .where(VerificationCode.is_used == 0)
            .values(is_used=1)
        )
        await self.db.commit()

    async def count_verification_requests(self, email: str, type: VerificationTypeEnum, since: datetime):
        result = await self.db.execute(
            select(func.count(VerificationCode.id))
            .where(VerificationCode.email == email)
            .where(VerificationCode.type == type)
            .where(VerificationCode.created_at >= since)
        )
        return result.scalar() or 0
