from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import joinedload
from app.models.booking import Deal, DealStatusEnum
from app.models.car import Car
from app.models.user import User
from app.repositories.base_repository import BaseRepository

class BookingRepository(BaseRepository[Deal]):
    def __init__(self, db: AsyncSession):
        super().__init__(Deal, db)

    async def get_user_bookings(self, user_id: int) -> List[Deal]:
        result = await self.db.execute(
            select(Deal)
            .where(Deal.user_id == user_id)
            .options(joinedload(Deal.car))
            .order_by(Deal.created_at.desc())
        )
        return result.scalars().all()

    async def get_admin_bookings(self, status: Optional[DealStatusEnum] = None, search: Optional[str] = None) -> List[Deal]:
        query = select(Deal).join(Deal.user).join(Deal.car).options(joinedload(Deal.user), joinedload(Deal.car))
        
        if status:
            query = query.where(Deal.status == status)
        
        if search:
            from sqlalchemy import String
            query = query.where(
                or_(
                    User.name.ilike(f"%{search}%"),
                    func.cast(Deal.id, String).ilike(f"%{search}%")
                )
            )
        
        query = query.order_by(desc(Deal.created_at))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_stats_for_user(self, user_id: int):
        total_deals_res = await self.db.execute(select(func.count(Deal.id)).where(Deal.user_id == user_id))
        total_deals = total_deals_res.scalar() or 0

        active_deals_res = await self.db.execute(select(func.count(Deal.id)).where(
            Deal.user_id == user_id,
            Deal.status == DealStatusEnum.active
        ))
        active_deals = active_deals_res.scalar() or 0

        total_spent_res = await self.db.execute(select(func.sum(Deal.total_price)).where(
            Deal.user_id == user_id,
            Deal.status.in_([DealStatusEnum.confirmed, DealStatusEnum.active, DealStatusEnum.completed])
        ))
        total_spent = total_spent_res.scalar() or 0
        
        return total_deals, active_deals, total_spent

    async def check_overlap(self, car_id: int, start_time: Any, end_time: Any, exclude_booking_id: Optional[int] = None) -> bool:
        query = select(Deal).where(
            Deal.car_id == car_id,
            Deal.status.in_([DealStatusEnum.pending, DealStatusEnum.confirmed, DealStatusEnum.active]),
            or_(
                and_(Deal.start_time <= start_time, Deal.end_time > start_time),
                and_(Deal.start_time < end_time, Deal.end_time >= end_time),
                and_(Deal.start_time >= start_time, Deal.end_time <= end_time)
            )
        )
        
        if exclude_booking_id:
            query = query.where(Deal.id != exclude_booking_id)
            
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def get_bookings_for_status_refresh(self) -> List[Deal]:
        # Bookings that are confirmed but should be active (start_time <= now <= end_time)
        # Bookings that are active but should be completed (now > end_time)
        # Bookings that are pending and older than 15 minutes (should be cancelled)
        from datetime import datetime, timezone, timedelta
        # For SQLite, naive datetimes are often safer for comparison if stored as naive
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        fifteen_mins_ago = now - timedelta(minutes=15)
        
        query = select(Deal).where(
            or_(
                and_(Deal.status == DealStatusEnum.confirmed, Deal.start_time <= now, Deal.end_time > now),
                and_(Deal.status == DealStatusEnum.active, now > Deal.end_time),
                and_(Deal.status == DealStatusEnum.pending, Deal.created_at < fifteen_mins_ago)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()
