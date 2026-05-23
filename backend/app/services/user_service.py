import re
from datetime import date
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.booking_repository import BookingRepository
from app.models.user import User
from app.schemas.user import UserUpdate, PasswordChange, CardCreate
from app.core.security import verify_password, get_password_hash


class UserService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.booking_repo = BookingRepository(db)
        self.db = db

    async def get_me(self, user: User):
        # Prepare card info
        cards = []
        for card in user.cards:
            cards.append(
                {
                    "id": card.id,
                    "card_number": card.card_number,
                    "expires": card.expires.strftime("%m/%y") if card.expires else "",
                }
            )

        # Fetch booking history
        deals = await self.booking_repo.get_user_bookings(user.id)
        bookings = []
        for deal in deals:
            car_name = "Unknown Car"
            car_images = ""
            if deal.car:
                car_name = f"{deal.car.brand} {deal.car.model}"
                car_images = deal.car.images
                
            bookings.append(
                {
                    "id": f"DRV-{deal.id}",
                    "raw_id": deal.id,
                    "car": car_name,
                    "car_image": car_images,
                    "date": f"{deal.start_time.strftime('%b %d')} - {deal.end_time.strftime('%b %d, %Y')}",
                    "location": deal.pick_up_location,
                    "status": deal.status,
                    "price": f"${deal.total_price:,.0f}",
                    "total_price": float(deal.total_price),
                    "additional_services": (
                        deal.additional_services.split(", ")
                        if deal.additional_services
                        else []
                    ),
                }
            )

        # Calculate stats
        total_deals, active_deals, total_spent = (
            await self.booking_repo.get_stats_for_user(user.id)
        )
        reward_points = int(total_spent // 10)

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "drivers_license": user.drivers_license,
            "address": user.address,
            "created_at": user.created_at,
            "cards": cards,
            "stats": {
                "total_deals": total_deals,
                "active_deals": active_deals,
                "total_spent": float(total_spent),
                "reward_points": reward_points,
            },
            "booking_history": bookings,
        }

    async def update_me(self, user: User, data: UserUpdate):
        if data.name is not None:
            user.name = data.name
        if data.email is not None:
            if data.email != user.email:
                email_check = await self.user_repo.get_by_email(data.email)
                if email_check:
                    raise HTTPException(status_code=400, detail="Email already taken")
            user.email = data.email
        if data.phone is not None:
            user.phone = data.phone
        if data.drivers_license is not None:
            user.drivers_license = data.drivers_license
        if data.address is not None:
            user.address = data.address

        await self.db.commit()
        await self.db.refresh(user)

        return {
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "drivers_license": user.drivers_license,
            "address": user.address,
        }

    async def add_card(self, user: User, data: CardCreate):
        if not re.match(r"^\d{16}$", data.card_number):
            raise HTTPException(
                status_code=400,
                detail="Card number must be exactly 16 digits and contain only numbers",
            )

        try:
            month, year = data.expires.split("/")
            year = int("20" + year)
            month = int(month)
            expiry_date = date(year, month, 1)

            today = date.today()
            current_month_start = date(today.year, today.month, 1)
            if expiry_date < current_month_start:
                raise HTTPException(
                    status_code=400, detail="Card expiration date cannot be in the past"
                )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=400, detail="Invalid expiration date format. Use MM/YY"
            )

        from app.models.user import Card

        new_card = Card(
            user_id=user.id, card_number=data.card_number, expires=expiry_date
        )
        self.db.add(new_card)
        await self.db.commit()
        await self.db.refresh(new_card)
        return new_card

    async def delete_card(self, user: User, card_id: int):
        from app.models.user import Card
        from sqlalchemy import select, delete

        stmt = select(Card).where(Card.id == card_id, Card.user_id == user.id)
        result = await self.db.execute(stmt)
        card = result.scalar_one_or_none()

        if not card:
            raise HTTPException(status_code=404, detail="Card not found")

        await self.db.delete(card)
        await self.db.commit()
        return {"status": "success", "message": "Card deleted successfully"}

    async def change_password(self, user: User, data: PasswordChange):
        if not verify_password(data.old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect current password")

        user.password_hash = get_password_hash(data.new_password)
        await self.db.commit()
        return {"status": "success", "message": "Password updated successfully"}
