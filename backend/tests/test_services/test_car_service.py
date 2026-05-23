import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.services.car_service import CarService
from app.models.car import TransmissionEnum, FuelTypeEnum, CarStatusEnum

@pytest.mark.asyncio
async def test_get_car_by_id_success(mock_db):
    """Test that get_car_by_id returns correct data for a valid ID."""
    car_id = 1
    mock_car = MagicMock()
    mock_car.id = car_id
    mock_car.brand = "Tesla"
    mock_car.model = "Model 3"
    mock_car.year = 2023
    mock_car.license_plate = "TESLA-001"
    mock_car.color = "White"
    mock_car.passengers = 5
    mock_car.luggage = 2
    mock_car.transmission = TransmissionEnum.automatic
    mock_car.fuel_type = FuelTypeEnum.electricity
    mock_car.features = "GPS, Bluetooth"
    mock_car.description = "A great electric car"
    mock_car.images = "https://example.com/car.jpg"
    mock_car.price_per_day = 150.0
    mock_car.status = CarStatusEnum.available
    mock_car.created_at = "2023-01-01"
    mock_car.updated_at = "2023-01-01"
    
    with patch("app.services.car_service.CarRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get = AsyncMock(return_value=mock_car)
        
        service = CarService(mock_db)
        result = await service.get_car_by_id(car_id)
        
        assert result["id"] == car_id
        assert result["make"] == "Tesla"
        assert result["transmission"] == "automatic"
        assert result["fuel_type"] == "electricity"
        repo_instance.get.assert_called_once_with(car_id)

@pytest.mark.asyncio
async def test_get_car_by_id_not_found(mock_db):
    """Test that get_car_by_id raises 404 for an invalid ID."""
    car_id = 999
    with patch("app.services.car_service.CarRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get = AsyncMock(return_value=None)
        
        service = CarService(mock_db)
        with pytest.raises(HTTPException) as exc:
            await service.get_car_by_id(car_id)
        
        assert exc.value.status_code == 404
        assert exc.value.detail == "Car not found"
        repo_instance.get.assert_called_once_with(car_id)

@pytest.mark.asyncio
async def test_get_cars_filtering_and_pagination(mock_db):
    """Test that filtering and pagination parameters are processed and passed correctly."""
    filters = {
        "transmission": "automatic",
        "fuel_type": "electricity",
        "passengers": "5",
        "luggage": "2",
        "features": "GPS",
        "category": "Sedan",
        "sort": "price_low"
    }
    page = 2
    page_size = 10
    
    with patch("app.services.car_service.CarRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get_available_cars = AsyncMock(return_value=[])
        repo_instance.count_available_cars = AsyncMock(return_value=25)
        
        service = CarService(mock_db)
        result = await service.get_cars(filters, page, page_size)
        
        # Check skip calculation: (2-1) * 10 = 10
        repo_instance.get_available_cars.assert_called_once()
        args, _ = repo_instance.get_available_cars.call_args
        
        # args[0] is filters, args[1] is skip, args[2] is limit
        assert args[1] == 10
        assert args[2] == 10
        
        # Check filters transformation
        passed_filters = args[0]
        assert passed_filters["transmission"] == [TransmissionEnum.automatic]
        assert passed_filters["fuel_type"] == [FuelTypeEnum.electricity]
        assert passed_filters["passengers"] == [5]
        assert passed_filters["luggage"] == [2]
        assert passed_filters["features"] == ["GPS"]
        assert passed_filters["category"] == ["Sedan"]
        assert passed_filters["sort"] == "price_low"
        
        assert result["total_items"] == 25
        assert result["total_pages"] == 3 # (25 + 10 - 1) // 10 = 3

@pytest.mark.asyncio
async def test_get_cars_sorting(mock_db):
    """Test that sorting parameter is handled correctly."""
    filters = {"sort": "price_high"}
    page = 1
    page_size = 6
    
    with patch("app.services.car_service.CarRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get_available_cars = AsyncMock(return_value=[])
        repo_instance.count_available_cars = AsyncMock(return_value=10)
        
        service = CarService(mock_db)
        await service.get_cars(filters, page, page_size)
        
        repo_instance.get_available_cars.assert_called_once()
        args, _ = repo_instance.get_available_cars.call_args
        assert args[0]["sort"] == "price_high"
