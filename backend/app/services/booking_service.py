from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.booking_repository import BookingRepository
from app.repositories.car_repository import CarRepository
from app.repositories.service_repository import ServiceRepository
from app.repositories.discount_repository import DiscountRepository
from app.models.booking import DealStatusEnum
from app.models.car import CarStatusEnum
from app.schemas.booking import BookingCreate
from app.models.user import User
from app.models.car import Car


class BookingService:
    def __init__(self, db: AsyncSession):
        self.booking_repo = BookingRepository(db)
        self.car_repo = CarRepository(db)
        self.service_repo = ServiceRepository(db)
        self.discount_repo = DiscountRepository(db)
        self.db = db

    async def create_booking(self, user: User, booking_data: BookingCreate):
        car = await self.car_repo.get(booking_data.car_id)
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")

        if car.status not in [CarStatusEnum.available]:
            raise HTTPException(
                status_code=400,
                detail="Cannot create booking for a car that is not available",
            )

        # Check for overlapping bookings
        has_overlap = await self.booking_repo.check_overlap(
            booking_data.car_id, booking_data.start_time, booking_data.end_time
        )
        if has_overlap:
            raise HTTPException(
                status_code=400,
                detail="Car is already booked for the selected time range",
            )

        services = await self.service_repo.get_all_ordered()
        discounts = await self.discount_repo.get_all_ordered()
        booking_duration = (booking_data.end_time - booking_data.start_time).days
        if booking_duration < 1:
            booking_duration = 1
            
        services_price = self.calculate_services_price(
            services, booking_data.additional_services, booking_duration
        )

        booking_dict = booking_data.dict()
        booking_dict["user_id"] = user.id
        booking_dict["status"] = DealStatusEnum.pending
        booking_dict["additional_services"] = ", ".join(
            map(str, booking_data.additional_services)
        )
        booking_dict["total_price"] = self.calculate_total_price(
            car, booking_duration, services_price, discounts
        )

        booking = await self.booking_repo.create(booking_dict)
        return booking

    async def refresh_booking_statuses(self):
        bookings = await self.booking_repo.get_bookings_for_status_refresh()
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        fifteen_mins_ago = now - timedelta(minutes=15)
        
        for booking in bookings:
            new_status = None
            
            # Ensure datetimes are aware for comparison
            start_time = booking.start_time
            if start_time and start_time.tzinfo is None:
                start_time = start_time.replace(tzinfo=timezone.utc)
                
            end_time = booking.end_time
            if end_time and end_time.tzinfo is None:
                end_time = end_time.replace(tzinfo=timezone.utc)
                
            created_at = booking.created_at
            if created_at and created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            if booking.status == DealStatusEnum.confirmed and start_time <= now and end_time > now:
                new_status = DealStatusEnum.active
            elif booking.status == DealStatusEnum.active and now > end_time:
                new_status = DealStatusEnum.completed
            elif booking.status == DealStatusEnum.pending and created_at < fifteen_mins_ago:
                new_status = DealStatusEnum.cancelled
            
            if new_status:
                await self.booking_repo.update(booking, {"status": new_status})

    async def get_user_bookings(self, user_id: int):
        await self.refresh_booking_statuses()
        return await self.booking_repo.get_user_bookings(user_id)

    async def confirm_booking(self, booking_id: int, user_id: int):
        booking = await self.booking_repo.get(booking_id)
        if not booking or booking.user_id != user_id:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.status != DealStatusEnum.pending:
            raise HTTPException(status_code=400, detail="Only pending bookings can be confirmed")
            
        # Re-check overlap just in case
        has_overlap = await self.booking_repo.check_overlap(
            booking.car_id, booking.start_time, booking.end_time, exclude_booking_id=booking.id
        )
        if has_overlap:
            await self.booking_repo.update(booking, {"status": DealStatusEnum.cancelled})
            raise HTTPException(status_code=400, detail="Car is no longer available for these dates")
            
        return await self.booking_repo.update(booking, {"status": DealStatusEnum.confirmed})

    async def dispute_booking(self, booking_id: int):
        booking = await self.booking_repo.get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        if booking.status not in [DealStatusEnum.pending, DealStatusEnum.confirmed, DealStatusEnum.active]:
            raise HTTPException(status_code=400, detail="Cannot dispute booking in current status")
            
        return await self.booking_repo.update(booking, {"status": DealStatusEnum.disputed})

    async def get_booking_by_id(self, booking_id: int, user_id: int):
        await self.refresh_booking_statuses()
        booking = await self.booking_repo.get(booking_id)
        if not booking or booking.user_id != user_id:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking

    async def cancel_booking(self, booking_id: int, user_id: int):
        booking = await self.booking_repo.get(booking_id)
        if not booking or booking.user_id != user_id:
            raise HTTPException(status_code=404, detail="Booking not found")

        if booking.status not in [DealStatusEnum.pending, DealStatusEnum.confirmed]:
            raise HTTPException(
                status_code=400, detail="Cannot cancel booking in current status"
            )

        return await self.booking_repo.update(
            booking, {"status": DealStatusEnum.cancelled}
        )

    def calculate_services_price(
        self, services, selected_ids, booking_duration
    ) -> float:
        total = 0.0
        for service in services:
            if service.id in selected_ids:
                total += float(service.price * booking_duration)
        return total

    # Calculate discount amount based on booking duration and applicable discounts.
    # Returns: discount amount to be subtracted from the booking price
    def calculate_discount_amount(
        self, total_price_without_discounts, booking_duration, discounts
    ) -> float:
        max_discount_percent = 0.0

        # Filter applicable discounts based on booking duration
        for discount in discounts:
            # Check if booking duration falls within discount range
            if discount.min_days <= booking_duration and (
                discount.max_days is None or booking_duration <= discount.max_days
            ):
                # Pick the highest discount percentage
                if float(discount.discount_percent) > max_discount_percent:
                    max_discount_percent = float(discount.discount_percent)

        return total_price_without_discounts * (max_discount_percent / 100)

    def calculate_total_price(
        self, car: Car, booking_duration: int, services_price: float, discounts: list
    ) -> float:
        total_price_without_discounts = (
            float(booking_duration * car.price_per_day) + services_price
        )
        discount_amount = self.calculate_discount_amount(
            total_price_without_discounts, booking_duration, discounts
        )
        total_price = total_price_without_discounts - discount_amount

        return total_price
