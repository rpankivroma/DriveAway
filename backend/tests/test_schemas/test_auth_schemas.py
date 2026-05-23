import pytest
from pydantic import ValidationError
from app.schemas.auth import UserRegister, UserLogin, ResetPasswordRequest, VerifyEmailRequest

def test_user_register_invalid_email():
    """Test that UserRegister rejects invalid email formats."""
    with pytest.raises(ValidationError):
        UserRegister(
            name="John Doe",
            email="invalid-email",
            password="password123"
        )

def test_user_register_missing_fields():
    """Test that UserRegister raises ValidationError when required fields are missing."""
    with pytest.raises(ValidationError):
        # Missing email and password
        UserRegister(name="John Doe")

def test_user_login_invalid_email():
    """Test that UserLogin rejects invalid email formats."""
    with pytest.raises(ValidationError):
        UserLogin(email="not-an-email", password="password123")

def test_verify_email_request_invalid_code():
    """Test that VerifyEmailRequest rejects codes that are not 6 digits."""
    # Too short
    with pytest.raises(ValidationError) as exc:
        VerifyEmailRequest(email="test@example.com", code="12345")
    assert "Verification code must be exactly 6 digits" in str(exc.value)

    # Too long
    with pytest.raises(ValidationError) as exc:
        VerifyEmailRequest(email="test@example.com", code="1234567")
    assert "Verification code must be exactly 6 digits" in str(exc.value)

    # Non-numeric
    with pytest.raises(ValidationError) as exc:
        VerifyEmailRequest(email="test@example.com", code="abc123")
    assert "Verification code must be exactly 6 digits" in str(exc.value)

def test_verify_email_request_valid_code():
    """Test that VerifyEmailRequest accepts a valid 6-digit code."""
    schema = VerifyEmailRequest(email="test@example.com", code="123456")
    assert schema.code == "123456"

def test_reset_password_request_invalid_code():
    """Test that ResetPasswordRequest rejects codes that are not 6 digits."""
    with pytest.raises(ValidationError) as exc:
        ResetPasswordRequest(
            email="test@example.com",
            code="123",
            new_password="newpassword123"
        )
    assert "Verification code must be exactly 6 digits" in str(exc.value)

def test_reset_password_request_valid():
    """Test that ResetPasswordRequest accepts valid data."""
    schema = ResetPasswordRequest(
        email="test@example.com",
        code="654321",
        new_password="securepassword"
    )
    assert schema.code == "654321"
    assert schema.email == "test@example.com"
