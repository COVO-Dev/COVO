import redis
import json
import logging
from typing import Any, Dict, Optional, Union, List
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        self.redis_client = None
        self.connect()
    
    def connect(self) -> bool:
        """Connect to Redis server"""
        try:
            self.redis_client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                password=settings.redis_password,
                db=settings.redis_db,
                decode_responses=True,  # Automatically decode responses to Python strings
                socket_timeout=5,  # 5 second timeout
                socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Successfully connected to Redis")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            self.redis_client = None
            return False
    
    def is_connected(self) -> bool:
        """Check if Redis connection is active"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get a value from Redis cache"""
        if not self.is_connected():
            logger.warning("Redis not connected, cannot get value")
            return None
        
        try:
            value = self.redis_client.get(key)
            if value is None:
                return None
            
            # Try to parse as JSON, if not return as string
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        except Exception as e:
            logger.error(f"Error getting value from Redis: {str(e)}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set a value in Redis cache with optional TTL"""
        if not self.is_connected():
            logger.warning("Redis not connected, cannot set value")
            return False
        
        try:
            # Convert non-string values to JSON
            if not isinstance(value, str):
                value = json.dumps(value)
            
            # Use default TTL if not specified
            if ttl is None:
                ttl = settings.redis_ttl
            
            self.redis_client.set(key, value, ex=ttl)
            return True
        except Exception as e:
            logger.error(f"Error setting value in Redis: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete a key from Redis cache"""
        if not self.is_connected():
            logger.warning("Redis not connected, cannot delete key")
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting key from Redis: {str(e)}")
            return False
    
    def flush(self) -> bool:
        """Flush all keys from the current database"""
        if not self.is_connected():
            logger.warning("Redis not connected, cannot flush database")
            return False
        
        try:
            self.redis_client.flushdb()
            return True
        except Exception as e:
            logger.error(f"Error flushing Redis database: {str(e)}")
            return False
    
    def increment_counter(self, key: str, amount: int = 1, ttl: Optional[int] = None) -> Optional[int]:
        """Increment a counter in Redis"""
        if not self.is_connected():
            logger.warning("Redis not connected, cannot increment counter")
            return None
        
        try:
            # Increment the counter
            value = self.redis_client.incrby(key, amount)
            
            # Set expiry if this is a new key or TTL is specified
            if ttl is not None or not self.redis_client.ttl(key) > 0:
                self.redis_client.expire(key, ttl or settings.redis_ttl)
            
            return value
        except Exception as e:
            logger.error(f"Error incrementing counter in Redis: {str(e)}")
            return None

# Create a singleton instance
redis_service = RedisService()