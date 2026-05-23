import pytest
import re
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.services.user_service import UserService
from app.schemas.user import PasswordChange, CardCreate, UserUpdate
from datetime import datetime, date, timezone

@pytest.mark.asyncio
async def test_get_me_success(mock_db):
    # Setup
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.name = "John Doe"
    mock_user.email = "john@example.com"
    mock_user.phone = "123456789"
    mock_user.drivers_license = "DL123"
    mock_user.address = "123 Main St"
    mock_user.cards = []
    mock_user.created_at = datetime.now(timezone.utc)
    
    with patch("app.services.user_service.BookingRepository") as MockBookingRepo:
        booking_repo = MockBookingRepo.return_value
        booking_repo.get_user_bookings = AsyncMock(return_value=[])
        booking_repo.get_stats_for_user = AsyncMock(return_value=(5, 1, 500.0))
        
        service = UserService(mock_db)
        result = await service.get_me(mock_user)
        
        # Assert
        assert result["id"] == 1
        assert result["name"] == "John Doe"
        assert result["stats"]["total_deals"] == 5
        assert result["stats"]["total_spent"] == 500.0
        assert result["stats"]["reward_points"] == 50 # 500 // 10
        assert isinstance(result["booking_history"], list)

@pytest.mark.asyncio
async def test_change_password_success(mock_db):
    # Setup
    mock_user = MagicMock()
    mock_user.password_hash = "old_hashed_password"
    data = PasswordChange(old_password="old_password123", new_password="new_password123")
    
    with patch("app.services.user_service.verify_password", return_value=True), \
         patch("app.services.user_service.get_password_hash", return_value="new_hashed_password"):
        
        service = UserService(mock_db)
        result = await service.change_password(mock_user, data)
        
        # Assert
        assert result["status"] == "success"
        assert mock_user.password_hash == "new_hashed_password"
        mock_db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_change_password_wrong_current(mock_db):
    # Setup
    mock_user = MagicMock()
    mock_user.password_hash = "old_hashed_password"
    data = PasswordChange(old_password="wrong_password", new_password="new_password123")
    
    with patch("app.services.user_service.verify_password", return_value=False):
        service = UserService(mock_db)
        
        # Execute & Assert
        with pytest.raises(HTTPException) as exc:
            await service.change_password(mock_user, data)
        assert exc.value.status_code == 400
        assert exc.value.detail == "Incorrect current password"

@pytest.mark.asyncio
async def test_add_card_success(mock_db):
    # Setup
    mock_user = MagicMock(id=1)
    # Use a future date
    future_year = (date.today().year % 100) + 1
    future_expires = f"12/{future_year}"
    data = CardCreate(card_number="1234567812345678", expires=future_expires)
    
    service = UserService(mock_db)
    
    # Execute
    result = await service.add_card(mock_user, data)
    
    # Assert
    assert result.card_number == "1234567812345678"
    assert result.user_id == 1
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()

@pytest.mark.asyncio
async def test_add_card_invalid_number(mock_db):
    # Setup
    mock_user = MagicMock(id=1)
    data = CardCreate(card_number="invalid", expires="12/25")
    
    service = UserService(mock_db)
    
    # Execute & Assert
    with pytest.raises(HTTPException) as exc:
        await service.add_card(mock_user, data)
    assert exc.value.status_code == 400
    assert "Card number must be exactly 16 digits" in exc.value.detail

@pytest.mark.asyncio
async def test_delete_card_success(mock_db):
    # Setup
    mock_user = MagicMock(id=1)
    mock_card = MagicMock(id=10, user_id=1)
    
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_card
    mock_db.execute = AsyncMock(return_value=mock_result)
    
    service = UserService(mock_db)
    
    # Execute
    result = await service.delete_card(mock_user, 10)
    
    # Assert
    assert result["status"] == "success"
    mock_db.delete.assert_called_once_with(mock_card)
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_delete_card_not_found(mock_db):
    # Setup
    mock_user = MagicMock(id=1)
    
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute = AsyncMock(return_value=mock_result)
    
    service = UserService(mock_db)
    
    # Execute & Assert
    with pytest.raises(HTTPException) as exc:
        await service.delete_card(mock_user, 99)
    assert exc.value.status_code == 404
    assert exc.value.detail == "Card not found"
