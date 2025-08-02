from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Dict, List, Any, Optional
from bson import ObjectId
from datetime import datetime
import logging
import json
from config import settings

# Import Redis service for caching
from redis_service import redis_service

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        # Synchronous client for current operations (lazy connection)
        self.sync_client = MongoClient(
            settings.mongodb_uri, 
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            connect=False  # Don't connect immediately
        )
        self.sync_db = self.sync_client['main']
        
        # Async client for FastAPI operations (future use)
        self.async_client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        self.async_db = self.async_client['main']
        
        # Cache configuration
        self.use_cache = redis_service.is_connected()
        if self.use_cache:
            logger.info("Redis cache enabled for database service")
        else:
            logger.warning("Redis cache not available, proceeding without caching")
    
    def get_campaign(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        """Get campaign by ID with Redis caching"""
        try:
            # Check cache first if Redis is available
            if self.use_cache:
                cache_key = f"campaign:{campaign_id}"
                cached_campaign = redis_service.get(cache_key)
                if cached_campaign:
                    logger.info(f"Cache hit for campaign {campaign_id}")
                    return cached_campaign
            
            logger.info(f"Searching for campaign with ID: {campaign_id}")
            campaign = self.sync_db.campaigns.find_one({"_id": ObjectId(campaign_id)})
            
            if campaign:
                logger.info(f"Found campaign: {campaign.get('title', 'No title')}")
                campaign["_id"] = str(campaign["_id"])
                # Convert brandId ObjectId to string - campaigns use 'brandId' field
                if "brandId" in campaign:
                    original_brand_id = campaign["brandId"]
                    campaign["brandId"] = str(campaign["brandId"])
                    # Also set brand_id for compatibility
                    campaign["brand_id"] = str(original_brand_id)
                    logger.info(f"Campaign brandId: {campaign['brandId']}")
                else:
                    logger.warning("Campaign does not have brandId field")
                
                # Cache the campaign if Redis is available
                if self.use_cache:
                    cache_key = f"campaign:{campaign_id}"
                    redis_service.set(cache_key, campaign, 3600)  # Cache for 1 hour
                    logger.info(f"Cached campaign {campaign_id}")
            else:
                logger.warning(f"No campaign found with ID: {campaign_id}")
                
            return campaign
        except Exception as e:
            logger.error(f"Error getting campaign {campaign_id}: {str(e)}")
            return None
    
    def get_brand(self, brand_id: str) -> Optional[Dict[str, Any]]:
        """Get brand by ID with Redis caching"""
        try:
            # Check cache first if Redis is available
            if self.use_cache:
                cache_key = f"brand:{brand_id}"
                cached_brand = redis_service.get(cache_key)
                if cached_brand:
                    logger.info(f"Cache hit for brand {brand_id}")
                    return cached_brand
            
            logger.info(f"Searching for brand with ID: {brand_id}")
            brand = self.sync_db.users.find_one({
                "_id": ObjectId(brand_id), 
                "role": "Brand"
            })
            
            if brand:
                logger.info(f"Found brand: {brand.get('companyName', 'No company name')}")
                brand["_id"] = str(brand["_id"])
                
                # Cache the brand if Redis is available
                if self.use_cache:
                    cache_key = f"brand:{brand_id}"
                    redis_service.set(cache_key, brand, 3600)  # Cache for 1 hour
                    logger.info(f"Cached brand {brand_id}")
            else:
                logger.warning(f"No brand found with ID: {brand_id}")
                # Check if user exists but with different role
                user_check = self.sync_db.users.find_one({"_id": ObjectId(brand_id)})
                if user_check:
                    logger.warning(f"User exists but role is: {user_check.get('role', 'Unknown')}")
                else:
                    logger.warning(f"No user found with ID: {brand_id}")
                    
            return brand
        except Exception as e:
            logger.error(f"Error getting brand {brand_id}: {str(e)}")
            return None
    
    def get_influencers_by_filter(self, filter_query: Dict[str, Any], limit: int = 50) -> List[Dict[str, Any]]:
        """Get influencers based on filter criteria with Redis caching"""
        try:
            # Create a cache key based on the filter criteria
            if self.use_cache:
                # Sort the filter criteria to ensure consistent cache keys
                sorted_criteria = json.dumps({**filter_query, "limit": limit}, sort_keys=True)
                cache_key = f"influencers:filter:{hash(sorted_criteria)}"
                cached_influencers = redis_service.get(cache_key)
                if cached_influencers:
                    logger.info(f"Cache hit for influencers with filter")
                    return cached_influencers
            
            influencers = list(self.sync_db.users.find(filter_query).limit(limit))
            for inf in influencers:
                inf["_id"] = str(inf["_id"])
            
            # Cache the results if Redis is available
            if self.use_cache:
                # Cache for a shorter time as influencer data may change more frequently
                redis_service.set(cache_key, influencers, 1800)  # Cache for 30 minutes
                logger.info(f"Cached {len(influencers)} influencers for filter query")
                
            return influencers
        except Exception as e:
            logger.error(f"Error getting filtered influencers: {str(e)}")
            return []
    
    def update_campaign_recommendations(
        self, 
        campaign_id: str, 
        recommendations: List[Dict[str, Any]]
    ) -> bool:
        """Update campaign with recommendations"""
        try:
            logger.info(f"Updating campaign {campaign_id} with {len(recommendations)} recommendations")
            result = self.sync_db.campaigns.update_one(
                {"_id": ObjectId(campaign_id)},
                {
                    "$set": {
                        "recommendedInfluencers": recommendations,
                        "lastRecommendationUpdate": datetime.utcnow(),
                        "recommendationStatus": "completed"
                    }
                }
            )
            logger.info(f"Update result: modified_count={result.modified_count}, matched_count={result.matched_count}")
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating campaign recommendations: {str(e)}")
            return False
    
    def set_campaign_recommendation_status(self, campaign_id: str, status: str) -> bool:
        """Set recommendation generation status"""
        try:
            result = self.sync_db.campaigns.update_one(
                {"_id": ObjectId(campaign_id)},
                {
                    "$set": {
                        "recommendationStatus": status,
                        "lastRecommendationUpdate": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error setting campaign status: {str(e)}")
            return False
    
    def get_influencer_by_id(self, influencer_id: str) -> Optional[Dict[str, Any]]:
        """Get single influencer by ID"""
        try:
            influencer = self.sync_db.users.find_one({
                "_id": ObjectId(influencer_id),
                "role": "Influencer"
            })
            if influencer:
                influencer["_id"] = str(influencer["_id"])
            return influencer
        except Exception as e:
            logger.error(f"Error getting influencer {influencer_id}: {str(e)}")
            return None
    
    def search_influencers(
        self,
        niche: Optional[str] = None,
        location: Optional[str] = None,
        min_followers: Optional[int] = None,
        max_followers: Optional[int] = None,
        influencer_type: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search influencers with various filters"""
        try:
            filter_query = {
                "role": "Influencer",
                "deactivated": {"$ne": True}
            }
            
            # Niche filter
            if niche:
                filter_query["$or"] = [
                    {"contentAndAudience.primaryNiche": {"$regex": niche, "$options": "i"}},
                    {"contentAndAudience.secondaryNiche": {"$regex": niche, "$options": "i"}},
                    {"contentAndAudience.contentCategories": {"$regex": niche, "$options": "i"}}
                ]
            
            # Location filter
            if location:
                location_filters = [
                    {"location.country": {"$regex": location, "$options": "i"}},
                    {"location.city": {"$regex": location, "$options": "i"}},
                    {"location.state": {"$regex": location, "$options": "i"}}
                ]
                if "$or" in filter_query:
                    filter_query["$and"] = [
                        {"$or": filter_query["$or"]},
                        {"$or": location_filters}
                    ]
                    del filter_query["$or"]
                else:
                    filter_query["$or"] = location_filters
            
            # Follower count filters
            if min_followers is not None or max_followers is not None:
                followers_filter = {}
                if min_followers is not None:
                    followers_filter["$gte"] = min_followers
                if max_followers is not None:
                    followers_filter["$lte"] = max_followers
                filter_query["followers"] = followers_filter
            
            # Influencer type filter
            if influencer_type:
                follower_ranges = {
                    "Nano": {"$gte": 1000, "$lt": 10000},
                    "Micro": {"$gte": 10000, "$lt": 50000},
                    "Mid-Tier": {"$gte": 50000, "$lt": 250000},
                    "Macro": {"$gte": 250000, "$lt": 1000000},
                    "Celebrity": {"$gte": 1000000}
                }
                if influencer_type in follower_ranges:
                    filter_query["followers"] = follower_ranges[influencer_type]
            
            # Execute query
            influencers = list(self.sync_db.users.find(filter_query).limit(limit))
            
            # Convert ObjectIds to strings
            for inf in influencers:
                inf["_id"] = str(inf["_id"])
            
            return influencers
            
        except Exception as e:
            logger.error(f"Error searching influencers: {str(e)}")
            return []
    
    def get_campaign_statistics(self, brand_id: Optional[str] = None) -> Dict[str, Any]:
        """Get campaign statistics"""
        try:
            pipeline = []
            
            if brand_id:
                pipeline.append({"$match": {"brandId": ObjectId(brand_id)}})
            
            pipeline.extend([
                {
                    "$group": {
                        "_id": None,
                        "total_campaigns": {"$sum": 1},
                        "campaigns_with_recommendations": {
                            "$sum": {
                                "$cond": [
                                    {"$gt": [{"$size": {"$ifNull": ["$recommendedInfluencers", []]}}, 0]},
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ])
            
            result = list(self.sync_db.campaigns.aggregate(pipeline))
            
            if result:
                stats = result[0]
                stats.pop("_id", None)
                return stats
            else:
                return {
                    "total_campaigns": 0,
                    "campaigns_with_recommendations": 0
                }
                
        except Exception as e:
            logger.error(f"Error getting campaign statistics: {str(e)}")
            return {}
    
    def close_connections(self):
        """Close database connections"""
        try:
            self.sync_client.close()
            self.async_client.close()
        except Exception as e:
            logger.error(f"Error closing database connections: {str(e)}")

    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            # Test sync connection
            self.sync_client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return False

    def get_all_campaigns(self) -> List[Dict[str, Any]]:
        """Get all campaigns from the database"""
        try:
            campaigns = list(self.sync_db.campaigns.find())
            for campaign in campaigns:
                campaign["_id"] = str(campaign["_id"])
                if "brandId" in campaign:
                    campaign["brandId"] = str(campaign["brandId"])
            return campaigns
        except Exception as e:
            logger.error(f"Error getting all campaigns: {str(e)}")
            return []

# Create global database service instance
database_service = DatabaseService()
