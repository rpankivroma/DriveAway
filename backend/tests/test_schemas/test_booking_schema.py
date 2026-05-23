import pytest
from datetime import datetime, timedelta
from pydantic import ValidationError
from app.schemas.booking import BookingCreate, BookingBase
from decimal import Decimal

def test_booking_create_valid():
    """Test that valid booking details pass validation."""
    start = datetime.now() + timedelta(days=1)
    end = start + timedelta(days=2)
    booking = BookingCreate(
        car_id=1,
        start_time=start,
        end_time=end,
        pick_up_location="Main Street 123",
        additional_services=["insurance", "gps"]
    )
    assert booking.car_id == 1
    assert booking.pick_up_location == "Main Street 123"

def test_booking_create_end_before_start():
    """Test that booking fails if end_time is before start_time."""
    start = datetime.now() + timedelta(days=2)
    end = start - timedelta(hours=1)
    with pytest.raises(ValidationError) as exc:
        BookingCreate(
            car_id=1,
            start_time=start,
            end_time=end,
            pick_up_location="Main Street 123"
        )
    assert "End time must be after start time" in str(exc.value)

def test_booking_create_missing_required_fields():
    """Test that BookingCreate raises ValidationError when required fields are missing."""
    with pytest.raises(ValidationError):
        # Missing pick_up_location and car_id
        BookingCreate(
            start_time=datetime.now(),
            end_time=datetime.now() + timedelta(days=1)
        )

def test_booking_base_negative_price():
    """Test that BookingBase rejects negative total_price."""
    start = datetime.now()
    end = start + timedelta(days=1)
    with pytest.raises(ValidationError) as exc:
        BookingBase(
            car_id=1,
            start_time=start,
            end_time=end,
            total_price=Decimal("-10.00"),
            status="pending"
        )
    assert "Total price cannot be negative" in str(exc.value)

def test_booking_base_valid():
    """Test that BookingBase accepts valid price and dates."""
    start = datetime.now()
    end = start + timedelta(days=1)
    booking = BookingBase(
        car_id=1,
        start_time=start,
        end_time=end,
        total_price=Decimal("150.50"),
        status="confirmed"
    )
    assert booking.total_price == Decimal("150.50")
