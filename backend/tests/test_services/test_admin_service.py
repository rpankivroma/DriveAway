import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.services.admin_service import AdminService
from app.schemas.car import CarCreate, CarUpdate
from app.schemas.discount import DiscountCreate
from decimal import Decimal

@pytest.mark.asyncio
async def test_create_car_success(mock_db):
    # Setup
    car_data = CarCreate(
        brand="Tesla",
        model="Model 3",
        year=2023,
        license_plate="TESLA-001",
        transmission="automatic",
        fuel_type="electricity",
        price_per_day=Decimal("150.0"),
        status="available"
    )
    
    with patch("app.services.admin_service.CarRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get_by_license_plate = AsyncMock(return_value=None)
        repo_instance.create = AsyncMock(return_value=MagicMock(
            id=1, 
            brand=car_data.brand,
            model=car_data.model,
            year=car_data.year,
            license_plate=car_data.license_plate,
            color=None,
            passengers=5,
            luggage=2,
            transmission="automatic",
            fuel_type="electricity",
            category=None,
            features=None,
            description=None,
            images=None,
            price_per_day=car_data.price_per_day,
            status="available",
            created_at="2023-01-01",
            updated_at="2023-01-01"
        ))
        
        service = AdminService(mock_db)
        result = await service.create_car(car_data)
        
        # Assert
        assert result["id"] == 1
        assert result["make"] == "Tesla"
        repo_instance.get_by_license_plate.assert_called_once_with(car_data.license_plate)
        repo_instance.create.assert_called_once()

@pytest.mark.asyncio
async def test_update_car_success(mock_db):
    # Setup
    car_id = 1
    car_data = CarUpdate(price_per_day=Decimal("200.0"))
    
    mock_car = MagicMock(id=car_id, license_plate="OLD-PLATE")
    
    with patch("app.services.admin_service.CarRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get = AsyncMock(return_value=mock_car)
        repo_instance.update = AsyncMock(return_value=MagicMock(
            id=car_id,
            brand="Tesla",
            model="Model 3",
            year=2023,
            license_plate="OLD-PLATE",
            color=None,
            passengers=5,
            luggage=2,
            transmission="automatic",
            fuel_type="electricity",
            category=None,
            features=None,
            description=None,
            images=None,
            price_per_day=Decimal("200.0"),
            status="available",
            created_at="2023-01-01",
            updated_at="2023-01-01"
        ))
        
        # Mocking the bookings count query
        mock_result = MagicMock()
        mock_result.scalar.return_value = 5
        mock_db.execute.return_value = mock_result
        
        service = AdminService(mock_db)
        result = await service.update_car(car_id, car_data)
        
        # Assert
        assert result["price_per_day"] == 200.0
        repo_instance.get.assert_called_once_with(car_id)
        repo_instance.update.assert_called_once()

@pytest.mark.asyncio
async def test_delete_car_success(mock_db):
    # Setup
    car_id = 1
    
    # Mock active bookings check
    mock_result = MagicMock()
    mock_result.scalar.return_value = 0
    mock_db.execute.return_value = mock_result
    
    with patch("app.services.admin_service.CarRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.remove = AsyncMock(return_value={"status": "success"})
        
        service = AdminService(mock_db)
        result = await service.delete_car(car_id)
        
        # Assert
        assert result["status"] == "success"
        repo_instance.remove.assert_called_once_with(car_id)

@pytest.mark.asyncio
async def test_create_discount_success(mock_db):
    # Setup
    data = DiscountCreate(min_days=3, max_days=7, discount_percent=Decimal("10.0"))
    
    with patch("app.services.admin_service.DiscountRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.create = AsyncMock(return_value=MagicMock(id=1, **data.model_dump()))
        
        service = AdminService(mock_db)
        result = await service.create_discount(data)
        
        # Assert
        assert result.id == 1
        repo_instance.create.assert_called_once()

@pytest.mark.asyncio
async def test_create_discount_invalid_range(mock_db):
    # Setup
    data = DiscountCreate(min_days=7, max_days=3, discount_percent=Decimal("10.0"))
    
    service = AdminService(mock_db)
    
    # Execute & Assert
    with pytest.raises(HTTPException) as exc:
        await service.create_discount(data)
    assert exc.value.status_code == 400
    assert "min_days must be less than max_days" in exc.value.detail

@pytest.mark.asyncio
async def test_update_discount_success(mock_db):
    # Setup
    discount_id = 1
    data = DiscountCreate(min_days=5, max_days=10, discount_percent=Decimal("15.0"))
    
    mock_discount = MagicMock(id=discount_id)
    
    with patch("app.services.admin_service.DiscountRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get = AsyncMock(return_value=mock_discount)
        repo_instance.update = AsyncMock(return_value=MagicMock(id=discount_id, **data.model_dump()))
        
        service = AdminService(mock_db)
        result = await service.update_discount(discount_id, data)
        
        # Assert
        assert result.id == discount_id
        repo_instance.get.assert_called_once_with(discount_id)
        repo_instance.update.assert_called_once()

@pytest.mark.asyncio
async def test_delete_discount_success(mock_db):
    # Setup
    discount_id = 1
    
    with patch("app.services.admin_service.DiscountRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.remove = AsyncMock(return_value={"status": "success"})
        
        service = AdminService(mock_db)
        result = await service.delete_discount(discount_id)
        
        # Assert
        assert result["status"] == "success"
        repo_instance.remove.assert_called_once_with(discount_id)
