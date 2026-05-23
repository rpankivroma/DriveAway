import pytest
from pydantic import ValidationError
from app.schemas.user import CardCreate
from datetime import datetime

def test_card_create_valid():
    """Test that valid card data is accepted."""
    # Use a future year to ensure it's not expired
    future_year = (datetime.now().year % 100) + 1
    expires = f"12/{future_year:02d}"
    
    card = CardCreate(
        card_number="1234567812345678",
        expires=expires
    )
    assert card.card_number == "1234567812345678"
    assert card.expires == expires

def test_card_create_invalid_number_length():
    """Test that card numbers not exactly 16 digits are rejected."""
    # Too short
    with pytest.raises(ValidationError) as exc:
        CardCreate(card_number="12345678", expires="12/28")
    assert "Card number must be exactly 16 digits" in str(exc.value)

    # Too long
    with pytest.raises(ValidationError) as exc:
        CardCreate(card_number="12345678123456789", expires="12/28")
    assert "Card number must be exactly 16 digits" in str(exc.value)

def test_card_create_non_numeric_number():
    """Test that non-numeric card numbers are rejected."""
    with pytest.raises(ValidationError) as exc:
        CardCreate(card_number="123456781234567a", expires="12/28")
    assert "Card number must be exactly 16 digits" in str(exc.value)

def test_card_create_invalid_expiry_format():
    """Test that invalid expiration date formats are rejected."""
    # Wrong separator
    with pytest.raises(ValidationError) as exc:
        CardCreate(card_number="1234567812345678", expires="12-28")
    assert "Expiration date must be in MM/YY format" in str(exc.value)

    # Invalid month
    with pytest.raises(ValidationError) as exc:
        CardCreate(card_number="1234567812345678", expires="13/28")
    assert "Expiration date must be in MM/YY format" in str(exc.value)

    # Not numeric
    with pytest.raises(ValidationError) as exc:
        CardCreate(card_number="1234567812345678", expires="AA/28")
    assert "Expiration date must be in MM/YY format" in str(exc.value)

def test_card_create_expired():
    """Test that expired cards are rejected."""
    # Past year
    with pytest.raises(ValidationError) as exc:
        CardCreate(card_number="1234567812345678", expires="01/20")
    assert "Card has expired" in str(exc.value)

    # Past month in current year
    now = datetime.now()
    if now.month > 1:
        past_month = now.month - 1
        current_year_short = now.year % 100
        with pytest.raises(ValidationError) as exc:
            CardCreate(
                card_number="1234567812345678", 
                expires=f"{past_month:02d}/{current_year_short:02d}"
            )
        assert "Card has expired" in str(exc.value)
