from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.user_service import UserService
from app.schemas.user import UserMeResponse, UserUpdate, PasswordChange, CardCreate, CardResponse

router = APIRouter(tags=["users"])

@router.get("/me", response_model=UserMeResponse)
async def get_me(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    user_service = UserService(db)
    return await user_service.get_me(user)

@router.put("/me", response_model=UserUpdate)
async def update_me(data: UserUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    user_service = UserService(db)
    return await user_service.update_me(user, data)

@router.post("/change-password")
async def change_password(data: PasswordChange, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    user_service = UserService(db)
    return await user_service.change_password(user, data)

@router.post("/cards", response_model=CardResponse)
async def add_card(data: CardCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    user_service = UserService(db)
    card = await user_service.add_card(user, data)
    return {
        "id": card.id,
        "card_number": card.card_number,
        "expires": card.expires.strftime("%m/%y") if card.expires else None
    }

@router.delete("/cards/{card_id}")
async def delete_card(card_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    user_service = UserService(db)
    return await user_service.delete_card(user, card_id)
