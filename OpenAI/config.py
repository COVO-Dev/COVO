from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Settings(BaseSettings):
    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    max_tokens: int = 1000
    temperature: float = 0.7
    
    # MongoDB Configuration
    mongodb_uri: str
    
    # API Configuration
    api_rate_limit: int = 60  # requests per minute
    timeout: int = 30  # seconds
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Override with environment variables if they exist
        if os.getenv("OPENAI_API_KEY"):
            self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if os.getenv("MODEL_NAME"):
            self.openai_model = os.getenv("MODEL_NAME")
        if os.getenv("MAX_TOKENS"):
            try:
                self.max_tokens = int(os.getenv("MAX_TOKENS"))
            except (ValueError, TypeError):
                self.max_tokens = 1000
        if os.getenv("TEMPERATURE"):
            try:
                self.temperature = float(os.getenv("TEMPERATURE"))
            except (ValueError, TypeError):
                self.temperature = 0.7
        if os.getenv("MONGODB_URI"):
            self.mongodb_uri = os.getenv("MONGODB_URI")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()