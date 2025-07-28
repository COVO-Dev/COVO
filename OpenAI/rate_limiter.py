import time
import logging
import asyncio
import json
from typing import Callable, Dict, Optional, Union, Any, List
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from redis_service import redis_service
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RateLimiter(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI):
        super().__init__(app)
        self.rate_limit = settings.api_rate_limit  # requests per window
        self.window = settings.api_rate_limit_window  # window in seconds
        self.burst_limit = settings.api_burst_limit  # burst limit
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for certain paths
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier (IP address or API key if available)
        client_id = self._get_client_identifier(request)
        
        # Check if Redis is available for rate limiting
        if not redis_service.is_connected():
            logger.warning("Redis not connected, skipping rate limiting")
            return await call_next(request)
        
        # Check rate limit
        current_count = self._increment_request_count(client_id)
        
        if current_count is None:
            # Redis error, proceed with caution
            logger.warning(f"Rate limiting error for {client_id}, proceeding with request")
            return await call_next(request)
        
        # Check if rate limit exceeded
        if current_count > self.rate_limit:
            # Check if within burst limit
            if current_count <= (self.rate_limit + self.burst_limit):
                # Apply artificial delay for burst requests
                delay = (current_count - self.rate_limit) * 0.5  # 0.5 seconds per excess request
                logger.warning(f"Rate limit burst for {client_id}, applying {delay}s delay")
                await self._apply_delay(delay)
                return await call_next(request)
            else:
                # Rate limit exceeded
                logger.warning(f"Rate limit exceeded for {client_id}: {current_count} requests")
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Too many requests. Please try again later.",
                        "limit": self.rate_limit,
                        "window": self.window,
                        "retry_after": self._get_retry_after()
                    }
                )
        
        # Proceed with the request
        return await call_next(request)
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client"""
        # First try to get API key from header
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"api:{api_key}"
        
        # Then try to get from authorization header
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            # Use first 8 chars of token as identifier
            token = auth.split(" ")[1][:8]
            return f"token:{token}"
        
        # Fall back to client IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Get the first IP in the chain
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host
        
        return f"ip:{client_ip}"
    
    def _increment_request_count(self, client_id: str) -> Optional[int]:
        """Increment the request count for a client and return the new count"""
        key = f"ratelimit:{client_id}:{int(time.time() / self.window)}"
        return redis_service.increment_counter(key, 1, self.window)
    
    def _get_retry_after(self) -> int:
        """Get the number of seconds until the rate limit resets"""
        current_window = int(time.time() / self.window)
        next_window = (current_window + 1) * self.window
        return next_window - int(time.time())
    
    async def _apply_delay(self, seconds: float) -> None:
        """Apply an artificial delay to slow down requests"""
        await asyncio.sleep(seconds)

def setup_rate_limiting(app: FastAPI) -> None:
    """Set up rate limiting middleware"""
    app.add_middleware(RateLimiter)