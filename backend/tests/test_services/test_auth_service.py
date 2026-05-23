import pytest
from unittest.mock import AsyncMock, patch, MagicMock, ANY
from fastapi import HTTPException
from app.services.auth_service import AuthService
from app.schemas.auth import UserRegister, UserLogin, ResetPasswordRequest
from app.models.user import RoleEnum, VerificationTypeEnum
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_register_success(mock_db):
    # Setup
    user_data = UserRegister(
        name="John Doe",
        email="john@example.com",
        password="password123",
        phone="123456789",
        drivers_license="DL123",
        address="123 Main St"
    )
    
    with patch("app.services.auth_service.UserRepository") as MockRepo, \
         patch("app.services.auth_service.get_password_hash") as mock_hash, \
         patch("app.services.auth_service.send_verification_email") as mock_email:
        
        repo_instance = MockRepo.return_value
        repo_instance.get_by_email = AsyncMock(return_value=None)
        repo_instance.create = AsyncMock(return_value=MagicMock(id=1, email=user_data.email))
        repo_instance.create_verification_code = AsyncMock()
        mock_hash.return_value = "hashed_password"
        
        service = AuthService(mock_db)
        
        # Execute
        result = await service.register(user_data)
        
        # Assert
        assert result["status"] == "success"
        repo_instance.get_by_email.assert_called_once_with(user_data.email)
        mock_hash.assert_any_call(user_data.password)
        
        # Verify user was created with hashed password
        repo_instance.create.assert_called_once()
        created_user_data = repo_instance.create.call_args[0][0]
        assert created_user_data["password_hash"] == "hashed_password"
        
        repo_instance.create_verification_code.assert_called_once()
        mock_email.assert_called_once()
        # Verify email was called with correct email
        args, _ = mock_email.call_args
        assert args[0] == user_data.email

@pytest.mark.asyncio
async def test_register_duplicate_email(mock_db):
    # Setup
    user_data = UserRegister(
        name="John Doe",
        email="john@example.com",
        password="password123",
        phone="123456789",
        drivers_license="DL123",
        address="123 Main St"
    )
    
    with patch("app.services.auth_service.UserRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get_by_email = AsyncMock(return_value=MagicMock(id=1))
        
        service = AuthService(mock_db)
        
        # Execute & Assert
        with pytest.raises(HTTPException) as exc:
            await service.register(user_data)
        assert exc.value.status_code == 400
        assert exc.value.detail == "Email already registered"

@pytest.mark.asyncio
async def test_login_success(mock_db):
    # Setup
    user_login = UserLogin(email="john@example.com", password="password123")
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.email = "john@example.com"
    mock_user.name = "John Doe"
    mock_user.password_hash = "hashed_password"
    mock_user.role = RoleEnum.client
    mock_user.is_verified = True
    
    with patch("app.services.auth_service.UserRepository") as MockRepo, \
         patch("app.services.auth_service.verify_password") as mock_verify, \
         patch("app.services.auth_service.create_access_token") as mock_token:
        
        repo_instance = MockRepo.return_value
        repo_instance.get_by_email = AsyncMock(return_value=mock_user)
        mock_verify.return_value = True
        mock_token.return_value = "fake_token"
        
        service = AuthService(mock_db)
        
        # Execute
        result = await service.login(user_login)
        
        # Assert
        assert result["access_token"] == "fake_token"
        assert result["user"]["email"] == "john@example.com"
        mock_verify.assert_called_once_with(user_login.password, mock_user.password_hash)

@pytest.mark.asyncio
async def test_login_wrong_password(mock_db):
    # Setup
    user_login = UserLogin(email="john@example.com", password="wrong_password")
    mock_user = MagicMock()
    mock_user.password_hash = "hashed_password"
    
    with patch("app.services.auth_service.UserRepository") as MockRepo, \
         patch("app.services.auth_service.verify_password") as mock_verify:
        
        repo_instance = MockRepo.return_value
        repo_instance.get_by_email = AsyncMock(return_value=mock_user)
        mock_verify.return_value = False
        
        service = AuthService(mock_db)
        
        # Execute & Assert
        with pytest.raises(HTTPException) as exc:
            await service.login(user_login)
        assert exc.value.status_code == 401

@pytest.mark.asyncio
async def test_forgot_password_success(mock_db):
    # Setup
    email = "john@example.com"
    mock_user = MagicMock(email=email)
    
    with patch("app.services.auth_service.UserRepository") as MockRepo, \
         patch("app.services.auth_service.get_password_hash") as mock_hash, \
         patch("app.services.auth_service.send_reset_email") as mock_email:
        
        repo_instance = MockRepo.return_value
        repo_instance.count_verification_requests = AsyncMock(return_value=0)
        repo_instance.get_by_email = AsyncMock(return_value=mock_user)
        repo_instance.invalidate_previous_codes = AsyncMock()
        repo_instance.create_verification_code = AsyncMock()
        mock_hash.return_value = "hashed_code"
        
        service = AuthService(mock_db)
        
        # Execute
        result = await service.forgot_password(email)
        
        # Assert
        assert result["status"] == "success"
        repo_instance.invalidate_previous_codes.assert_called_once_with(email, VerificationTypeEnum.reset_password)
        repo_instance.create_verification_code.assert_called_once()
        mock_email.assert_called_once()

@pytest.mark.asyncio
async def test_reset_password_success(mock_db):
    # Setup
    reset_data = ResetPasswordRequest(
        email="john@example.com",
        code="123456",
        new_password="new_password123"
    )
    
    mock_code = MagicMock()
    mock_code.code_hash = "hashed_code"
    mock_code.expires_at = datetime.now(timezone.utc).replace(year=2030) # Future
    
    mock_user = MagicMock(email="john@example.com")
    
    with patch("app.services.auth_service.UserRepository") as MockRepo, \
         patch("app.services.auth_service.verify_password") as mock_verify, \
         patch("app.services.auth_service.get_password_hash") as mock_hash:
        
        repo_instance = MockRepo.return_value
        repo_instance.get_verification_code = AsyncMock(return_value=mock_code)
        repo_instance.get_by_email = AsyncMock(return_value=mock_user)
        mock_verify.return_value = True
        mock_hash.return_value = "new_hashed_password"
        
        service = AuthService(mock_db)
        
        # Execute
        result = await service.reset_password(reset_data)
        
        # Assert
        assert result["status"] == "success"
        assert mock_user.password_hash == "new_hashed_password"
        mock_db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_verify_email_success(mock_db):
    # Setup
    email = "john@example.com"
    code = "123456"
    
    mock_code = MagicMock()
    mock_code.code_hash = "hashed_code"
    mock_code.expires_at = datetime.now(timezone.utc).replace(year=2030)
    
    mock_user = MagicMock(email=email)
    
    with patch("app.services.auth_service.UserRepository") as MockRepo, \
         patch("app.services.auth_service.verify_password") as mock_verify:
        
        repo_instance = MockRepo.return_value
        repo_instance.get_verification_code = AsyncMock(return_value=mock_code)
        repo_instance.get_by_email = AsyncMock(return_value=mock_user)
        mock_verify.return_value = True
        
        service = AuthService(mock_db)
        
        # Execute
        result = await service.verify_email(email, code)
        
        # Assert
        assert result["status"] == "success"
        assert mock_user.is_verified == 1
        mock_db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_resend_verification_success(mock_db):
    # Setup
    email = "john@example.com"
    mock_user = MagicMock(email=email, is_verified=0)
    
    with patch("app.services.auth_service.UserRepository") as MockRepo, \
         patch("app.services.auth_service.get_password_hash") as mock_hash, \
         patch("app.services.auth_service.send_verification_email") as mock_email:
        
        repo_instance = MockRepo.return_value
        repo_instance.get_by_email = AsyncMock(return_value=mock_user)
        repo_instance.count_verification_requests = AsyncMock(return_value=0)
        repo_instance.invalidate_previous_codes = AsyncMock()
        repo_instance.create_verification_code = AsyncMock()
        mock_hash.return_value = "hashed_code"
        
        service = AuthService(mock_db)
        
        # Execute
        result = await service.resend_verification(email)
        
        # Assert
        assert result["status"] == "success"
        repo_instance.invalidate_previous_codes.assert_called_once_with(email, VerificationTypeEnum.verify_email)
        repo_instance.create_verification_code.assert_called_once()
        mock_email.assert_called_once_with(email, ANY)
