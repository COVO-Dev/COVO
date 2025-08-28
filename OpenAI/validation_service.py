import re
import logging
from typing import Dict, Any, List, Optional, Union, Tuple
from pydantic import BaseModel, Field, validator, EmailStr, constr
from bson import ObjectId
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom ObjectId validator
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('ObjectId must be a string')
        if not re.match(r'^[0-9a-fA-F]{24}$', v):
            raise ValueError('Invalid ObjectId format')
        return v

# Base model with common validation
class BaseValidationModel(BaseModel):
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

# Recommendation request validation model
class RecommendationRequestModel(BaseValidationModel):
    campaign_id: PyObjectId = Field(..., description="MongoDB ObjectId of the campaign")
    brand_id: PyObjectId = Field(..., description="MongoDB ObjectId of the brand")
    
    @validator('campaign_id', 'brand_id')
    def validate_object_id(cls, v):
        if not re.match(r'^[0-9a-fA-F]{24}$', v):
            raise ValueError('Invalid ObjectId format')
        return v

# Campaign creation request validation model
class CampaignCreateRequestModel(BaseValidationModel):
    campaign_id: PyObjectId = Field(..., description="MongoDB ObjectId of the newly created campaign")

# Feedback request validation model
class FeedbackRequestModel(BaseValidationModel):
    campaign_id: PyObjectId = Field(..., description="MongoDB ObjectId of the campaign")
    influencer_id: PyObjectId = Field(..., description="MongoDB ObjectId of the influencer")
    accepted: bool = Field(..., description="Whether the recommendation was accepted")
    feedback_text: Optional[str] = Field(None, description="Optional feedback text")
    
    @validator('feedback_text')
    def validate_feedback_text(cls, v):
        if v is not None:
            # Sanitize feedback text
            v = re.sub(r'[<>]', '', v)  # Remove potential HTML tags
            v = v.strip()
            if len(v) > 500:
                v = v[:500]  # Limit length
        return v

# Authentication request validation model
class AuthRequestModel(BaseValidationModel):
    email: EmailStr = Field(..., description="User email address")
    password: constr(min_length=8, max_length=64) = Field(..., description="User password")

# User creation validation model
class UserCreateModel(BaseValidationModel):
    email: EmailStr = Field(..., description="User email address")
    password: constr(min_length=8, max_length=64) = Field(..., description="User password")
    role: str = Field(..., description="User role")
    
    @validator('role')
    def validate_role(cls, v):
        valid_roles = ["admin", "Brand", "Influencer"]
        if v not in valid_roles:
            raise ValueError(f"Role must be one of: {', '.join(valid_roles)}")
        return v

class ValidationService:
    def validate_object_id(self, id_str: str) -> bool:
        """Validate MongoDB ObjectId format"""
        return bool(re.match(r'^[0-9a-fA-F]{24}$', id_str))
    
    def sanitize_string(self, text: str) -> str:
        """Sanitize string input"""
        if text is None:
            return ""
        
        # Remove potential HTML/script tags
        text = re.sub(r'<[^>]*>', '', text)
        
        # Remove control characters
        text = re.sub(r'[\x00-\x1F\x7F]', '', text)
        
        return text.strip()
    
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))
    
    def validate_and_sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and sanitize dictionary input"""
        sanitized = {}
        
        for key, value in data.items():
            # Sanitize keys
            key = self.sanitize_string(key)
            
            # Sanitize values based on type
            if isinstance(value, str):
                sanitized[key] = self.sanitize_string(value)
            elif isinstance(value, (int, float, bool, type(None))):
                sanitized[key] = value
            elif isinstance(value, dict):
                sanitized[key] = self.validate_and_sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = self.validate_and_sanitize_list(value)
            else:
                # Convert other types to string and sanitize
                sanitized[key] = self.sanitize_string(str(value))
        
        return sanitized
    
    def validate_and_sanitize_list(self, data: List[Any]) -> List[Any]:
        """Validate and sanitize list input"""
        sanitized = []
        
        for item in data:
            if isinstance(item, str):
                sanitized.append(self.sanitize_string(item))
            elif isinstance(item, (int, float, bool, type(None))):
                sanitized.append(item)
            elif isinstance(item, dict):
                sanitized.append(self.validate_and_sanitize_dict(item))
            elif isinstance(item, list):
                sanitized.append(self.validate_and_sanitize_list(item))
            else:
                # Convert other types to string and sanitize
                sanitized.append(self.sanitize_string(str(item)))
        
        return sanitized

# Create a singleton instance
validation_service = ValidationService()