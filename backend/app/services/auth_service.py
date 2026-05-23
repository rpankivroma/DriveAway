import random
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.core.security import get_password_hash, verify_password, create_access_token, ensure_aware
from app.models.user import User, VerificationCode, VerificationTypeEnum, RoleEnum
from app.services.email_service import send_verification_email, send_reset_email
from app.schemas.auth import UserRegister, UserLogin, ResetPasswordRequest

class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.db = db

    async def register(self, user_data: UserRegister):
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        new_user_dict = {
            "name": user_data.name,
            "email": user_data.email,
            "password_hash": get_password_hash(user_data.password),
            "phone": user_data.phone,
            "drivers_license": user_data.drivers_license,
            "address": user_data.address,
            "role": RoleEnum.client
        }
        
        new_user = await self.user_repo.create(new_user_dict)
        
        # Generate verification code
        code = "".join([str(random.randint(0, 9)) for _ in range(6)])
        code_hash = get_password_hash(code)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        
        verification_code = VerificationCode(
            email=user_data.email,
            type=VerificationTypeEnum.verify_email,
            code_hash=code_hash,
            expires_at=expires_at
        )
        await self.user_repo.create_verification_code(verification_code)
        
        # Send verification email
        send_verification_email(user_data.email, code)
        
        return {"status": "success", "message": "User registered successfully"}

    async def login(self, user_data: UserLogin):
        user = await self.user_repo.get_by_email(user_data.email)
        
        if not user or not verify_password(user_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please verify your email to log in."
            )
        
        access_token = create_access_token(data={"sub": user.email, "role": user.role})
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }

    async def forgot_password(self, email: str):
        # Rate limiting: Max 5 requests per hour per email
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        request_count = await self.user_repo.count_verification_requests(email, VerificationTypeEnum.reset_password, one_hour_ago)
        
        if request_count >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many reset requests. Please try again later."
            )

        user = await self.user_repo.get_by_email(email)
        
        # Always return 200 to prevent user enumeration
        if user:
            code = "".join([str(random.randint(0, 9)) for _ in range(6)])
            code_hash = get_password_hash(code)
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
            
            await self.user_repo.invalidate_previous_codes(email, VerificationTypeEnum.reset_password)
            
            reset_code = VerificationCode(
                email=email,
                type=VerificationTypeEnum.reset_password,
                code_hash=code_hash,
                expires_at=expires_at
            )
            await self.user_repo.create_verification_code(reset_code)
            
            send_reset_email(email, code)
            
        return {"status": "success", "message": "If the account exists, a verification code has been sent."}

    async def reset_password(self, request: ResetPasswordRequest):
        reset_code = await self.user_repo.get_verification_code(request.email, VerificationTypeEnum.reset_password)
        
        if not reset_code:
            raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
        if datetime.now(timezone.utc) > ensure_aware(reset_code.expires_at):
            raise HTTPException(status_code=400, detail="Verification code has expired")
        
        if not verify_password(request.code, reset_code.code_hash):
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        user = await self.user_repo.get_by_email(request.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.password_hash = get_password_hash(request.new_password)
        reset_code.is_used = 1
        
        await self.db.commit()
        return {"status": "success", "message": "Password updated successfully"}

    async def verify_email(self, email: str, code: str):
        verification_code = await self.user_repo.get_verification_code(email, VerificationTypeEnum.verify_email)
        
        if not verification_code:
            raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
        if datetime.now(timezone.utc) > ensure_aware(verification_code.expires_at):
            raise HTTPException(status_code=400, detail="Verification code has expired")
        
        if not verify_password(code, verification_code.code_hash):
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_verified = 1
        verification_code.is_used = 1
        
        await self.db.commit()
        return {"status": "success", "message": "Email verified successfully"}

    async def resend_verification(self, email: str):
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.is_verified:
            return {"status": "success", "message": "Email already verified"}
        
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        request_count = await self.user_repo.count_verification_requests(email, VerificationTypeEnum.verify_email, one_hour_ago)
        
        if request_count >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many verification requests. Please try again later."
            )

        code = "".join([str(random.randint(0, 9)) for _ in range(6)])
        code_hash = get_password_hash(code)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        
        await self.user_repo.invalidate_previous_codes(email, VerificationTypeEnum.verify_email)
        
        verification_code = VerificationCode(
            email=email,
            type=VerificationTypeEnum.verify_email,
            code_hash=code_hash,
            expires_at=expires_at
        )
        await self.user_repo.create_verification_code(verification_code)
        
        send_verification_email(email, code)
        return {"status": "success", "message": "Verification code resent successfully"}
