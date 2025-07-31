from datetime import datetime, timedelta
from typing import Dict, Optional, Any, Union
import logging
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models for authentication
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class User(BaseModel):
    user_id: str
    email: str
    role: str
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class AuthService:
    def __init__(self):
        self.secret_key = settings.auth_secret_key
        self.algorithm = settings.auth_algorithm
        self.access_token_expire_minutes = settings.auth_token_expire_minutes
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hashed version"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        return encoded_jwt
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.error(f"JWT decode error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> User:
        """Get current user from token"""
        try:
            payload = self.decode_token(token)
            user_id = payload.get("sub")
            role = payload.get("role")
            
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            token_data = TokenData(user_id=user_id, role=role)
            
            # In a real application, you would fetch the user from the database here
            # For now, we'll just return the user data from the token
            user = User(
                user_id=token_data.user_id,
                email=payload.get("email", ""),
                role=token_data.role or "user"
            )
            
            return user
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    async def get_current_active_user(self, current_user: User = Depends(get_current_user)) -> User:
        """Check if user is active"""
        if current_user.disabled:
            raise HTTPException(status_code=400, detail="Inactive user")
        return current_user
    
    def check_admin_role(self, user: User) -> bool:
        """Check if user has admin role"""
        return user.role == "admin"
    
    def check_brand_role(self, user: User) -> bool:
        """Check if user has brand role"""
        return user.role == "Brand"

# Create a singleton instance
auth_service = AuthService()

# Export functions for use in other modules
get_current_user = auth_service.get_current_user
get_current_active_user = auth_service.get_current_active_user
is_admin = auth_service.check_admin_role
is_brand = auth_service.check_brand_role