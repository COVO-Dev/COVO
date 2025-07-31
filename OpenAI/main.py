from fastapi import FastAPI, HTTPException, BackgroundTasks, Security, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from bson import ObjectId
import json
import time

from recommendation_service import recommendation_service
from config import settings
from validation_service import ValidationService
from auth_service import get_current_user, get_current_active_user, is_admin, is_brand
from rate_limiter import setup_rate_limiting
from redis_service import redis_service
from feedback_service import FeedbackService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="COVO Recommendation Service",
    description="AI-powered influencer recommendation system using OpenAI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup rate limiting middleware
setup_rate_limiting(app)

# Initialize services
validation_service = ValidationService()
feedback_service = FeedbackService()

# Security schemes
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)

# Combined security dependency
async def get_auth_token(api_key: str = Security(api_key_header), token: str = Security(oauth2_scheme)):
    if api_key:
        # Validate API key
        if api_key == settings.api_key:  # Compare with configured API key
            return {"type": "api_key", "key": api_key}
    if token:
        # JWT token validation is handled by get_current_user
        return {"type": "oauth2", "token": token}
    return None

# Pydantic models for API
class RecommendationRequest(BaseModel):
    campaign_id: str = Field(..., description="MongoDB ObjectId of the campaign")
    brand_id: str = Field(..., description="MongoDB ObjectId of the brand")

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    campaign_id: str
    total_candidates: int
    message: str
    ai_usage: Optional[Dict[str, Any]] = None

class CampaignCreateRequest(BaseModel):
    campaign_id: str = Field(..., description="MongoDB ObjectId of the newly created campaign")

class FeedbackRequest(BaseModel):
    recommendation_id: str = Field(..., description="ID of the recommendation")
    influencer_id: str = Field(..., description="ID of the influencer")
    campaign_id: str = Field(..., description="ID of the campaign")
    status: str = Field(..., description="Status of the feedback (e.g., approved, rejected)")
    feedback_text: Optional[str] = Field(None, description="Additional feedback text")

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    service: str

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint with basic service health information"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        service="COVO Recommendation Service",
        services={
            "api": ServiceStatus(
                status="healthy",
                message="API is operational"
            )
        },
        version="1.0.0"
    )

from pydantic import BaseModel, Field
from typing import Dict, Optional, Any
import psycopg2

# Update the HealthResponse model
class ServiceStatus(BaseModel):
    status: str
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    service: str
    services: Dict[str, ServiceStatus]
    version: str = "1.0.0"

@app.get("/health", response_model=HealthResponse)
async def health():
    """Comprehensive health check for all system components"""
    services_status = {}
    overall_status = "healthy"
    
    # Check MongoDB connection
    try:
        recommendation_service.db_service.sync_db.campaigns.find_one()
        services_status["mongodb"] = ServiceStatus(
            status="healthy",
            message="Connected to MongoDB",
            details={
                "uri": settings.mongodb_uri.split("@")[-1].split("/")[0],
                "collections": len(recommendation_service.db_service.sync_db.list_collection_names())
            }
        )
    except Exception as e:
        overall_status = "degraded"
        services_status["mongodb"] = ServiceStatus(
            status="unhealthy",
            message=f"MongoDB connection failed: {str(e)}"
        )
    
    # Check Redis connection
    try:
        redis_connected = redis_service.is_connected()
        if redis_connected:
            services_status["redis"] = ServiceStatus(
                status="healthy",
                message="Connected to Redis",
                details={"host": settings.redis_host, "port": settings.redis_port}
            )
        else:
            overall_status = "degraded"
            services_status["redis"] = ServiceStatus(
                status="unhealthy",
                message="Redis connection failed"
            )
    except Exception as e:
        overall_status = "degraded"
        services_status["redis"] = ServiceStatus(
            status="unhealthy",
            message=f"Redis error: {str(e)}"
        )
    
    # Check Vector DB connection if enabled
    if settings.vector_db_enabled:
        try:
            conn = psycopg2.connect(
                host=settings.vector_db_host,
                port=settings.vector_db_port,
                dbname=settings.vector_db_name,
                user=settings.vector_db_user,
                password=settings.vector_db_password
            )
            conn.close()
            services_status["vector_db"] = ServiceStatus(
                status="healthy",
                message="Connected to Vector Database",
                details={
                    "host": settings.vector_db_host,
                    "port": settings.vector_db_port,
                    "database": settings.vector_db_name
                }
            )
        except Exception as e:
            overall_status = "degraded" 
            services_status["vector_db"] = ServiceStatus(
                status="unhealthy",
                message=f"Vector DB connection failed: {str(e)}"
            )
    
    # Check OpenAI API connection
    try:
        # Simple model list request to check OpenAI connectivity
        api_status = recommendation_service.openai_client.check_api_status()
        services_status["openai"] = ServiceStatus(
            status="healthy",
            message="Connected to OpenAI API",
            details={"model": settings.openai_model}
        )
    except Exception as e:
        overall_status = "degraded"
        services_status["openai"] = ServiceStatus(
            status="unhealthy",
            message=f"OpenAI API error: {str(e)}"
        )
    
    # Return overall health status
    if overall_status != "healthy":
        logger.warning(f"System health check: {overall_status}")
    else:
        logger.info("System health check: healthy")
        
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        service="COVO Recommendation Service",
        services=services_status
    )
@app.post("/recommendations/generate", response_model=RecommendationResponse)
async def generate_recommendations(request: RecommendationRequest, auth: Dict = Depends(get_auth_token)):
    """
    Generate AI-powered influencer recommendations for a campaign
    """
    # Check authentication
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    try:
        logger.info(f"Generating recommendations for campaign {request.campaign_id}")
        
        # Sanitize inputs
        sanitized_campaign_id = validation_service.sanitize_string(request.campaign_id)
        sanitized_brand_id = validation_service.sanitize_string(request.brand_id)
        
        # Validate ObjectIds
        try:
            validation_service.validate_object_id(sanitized_campaign_id)
            validation_service.validate_object_id(sanitized_brand_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid campaign_id or brand_id format")
        
        # Generate recommendations
        result = recommendation_service.generate_campaign_recommendations(
            campaign_id=sanitized_campaign_id
        )
        
        return RecommendationResponse(**result)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/recommendations/feedback")
async def submit_feedback(
    feedback: FeedbackRequest,
    user: Dict = Depends(get_current_active_user)
):
    """Submit feedback on recommendations"""
    # Only brand users can submit feedback
    if not is_brand(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only brand users can submit feedback"
        )
    
    try:
        # Process and store feedback
        result = await feedback_service.record_feedback(
            recommendation_id=feedback.recommendation_id,
            influencer_id=feedback.influencer_id,
            campaign_id=feedback.campaign_id,
            brand_id=user.get("_id"),  # Use authenticated brand ID
            status=feedback.status,
            feedback_text=feedback.feedback_text
        )
        
        return {"success": True, "message": "Feedback recorded successfully", "data": result}
    except Exception as e:
        logger.error(f"Error recording feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/campaigns/auto-recommend")
async def auto_recommend_on_campaign_create(
    request: CampaignCreateRequest, 
    background_tasks: BackgroundTasks
):
    """
    Automatically generate recommendations when a campaign is created
    This endpoint should be called by the main backend when a campaign is created
    """
    try:
        logger.info(f"Auto-generating recommendations for new campaign {request.campaign_id}")
        
        # Validate ObjectId
        try:
            ObjectId(request.campaign_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid campaign_id format")
        
        # Get campaign to find brand_id
        campaign = recommendation_service.db_service.get_campaign(request.campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Extract brand ID from campaign - campaigns use 'brandId' field
        brand_id = str(campaign.get("brandId"))
        if not brand_id or brand_id == "None":
            raise HTTPException(status_code=400, detail="Campaign has no associated brand")
        
        # Add recommendation generation to background tasks
        background_tasks.add_task(
            generate_recommendations_background,
            request.campaign_id,
            brand_id
        )
        
        return {
            "message": "Recommendation generation started",
            "campaign_id": request.campaign_id,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Error in auto-recommend: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/campaigns/{campaign_id}/recommendations")
async def get_campaign_recommendations(campaign_id: str):
    """
    Get existing recommendations for a campaign
    """
    try:
        # Validate ObjectId
        try:
            ObjectId(campaign_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid campaign_id format")
        
        # Get campaign with recommendations
        campaign = recommendation_service.db_service.get_campaign(campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        recommendations = campaign.get("recommendedInfluencers", [])
        
        return {
            "campaign_id": campaign_id,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations),
            "last_updated": campaign.get("lastRecommendationUpdate"),
            "has_recommendations": len(recommendations) > 0
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/campaigns/{campaign_id}/regenerate-recommendations")
async def regenerate_recommendations(campaign_id: str, background_tasks: BackgroundTasks):
    """
    Regenerate recommendations for an existing campaign
    """
    try:
        # Validate ObjectId
        try:
            ObjectId(campaign_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid campaign_id format")
        
        # Get campaign to find brand_id
        campaign = recommendation_service.db_service.get_campaign(campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Extract brand ID from campaign - campaigns use 'brandId' field
        brand_id = str(campaign.get("brandId"))
        if not brand_id or brand_id == "None":
            raise HTTPException(status_code=400, detail="Campaign has no associated brand")
        
        # Add recommendation generation to background tasks
        background_tasks.add_task(
            generate_recommendations_background,
            campaign_id,
            brand_id
        )
        
        return {
            "message": "Recommendation regeneration started",
            "campaign_id": campaign_id,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Error regenerating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/influencers/search")
async def search_influencers(
    niche: Optional[str] = None,
    location: Optional[str] = None,
    min_followers: Optional[int] = None,
    max_followers: Optional[int] = None,
    limit: int = 20
):
    """
    Search influencers with filters
    """
    try:
        # Execute search
        influencers = recommendation_service.db_service.search_influencers(
            niche=niche,
            location=location,
            min_followers=min_followers,
            max_followers=max_followers,
            limit=limit
        )
        
        return {
            "influencers": influencers,
            "total_found": len(influencers),
            "filters_applied": {
                "niche": niche,
                "location": location,
                "min_followers": min_followers,
                "max_followers": max_followers
            }
        }
        
    except Exception as e:
        logger.error(f"Error searching influencers: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def generate_recommendations_background(campaign_id: str, brand_id: str):
    """
    Background task to generate recommendations
    """
    try:
        logger.info(f"Background task: Generating recommendations for campaign {campaign_id}")
        result = recommendation_service.generate_campaign_recommendations(campaign_id)
        logger.info(f"Background task completed: {len(result.get('recommendations', []))} recommendations generated")
    except Exception as e:
        logger.error(f"Background task failed: {str(e)}")

@app.get("/debug/campaign/{campaign_id}")
async def debug_campaign(campaign_id: str):
    """
    Debug endpoint to check campaign data
    """
    try:
        # Validate ObjectId
        try:
            ObjectId(campaign_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid campaign_id format")
        
        # Get campaign with debugging
        logger.info(f"Debug: Looking for campaign {campaign_id}")
        campaign = recommendation_service.db_service.get_campaign(campaign_id)
        
        if not campaign:
            # Check if campaign exists in database
            raw_campaign = recommendation_service.db_service.sync_db.campaigns.find_one({"_id": ObjectId(campaign_id)})
            return {
                "campaign_id": campaign_id,
                "campaign_found": False,
                "raw_campaign_exists": raw_campaign is not None,
                "raw_campaign_data": str(raw_campaign) if raw_campaign else None
            }
        
        # Get brand if campaign exists
        brand_id = campaign.get("brandId")
        brand = None
        if brand_id:
            brand = recommendation_service.db_service.get_brand(brand_id)
        
        return {
            "campaign_id": campaign_id,
            "campaign_found": True,
            "campaign_title": campaign.get("title"),
            "campaign_brand_id": campaign.get("brandId"),
            "brand_found": brand is not None,
            "brand_company_name": brand.get("companyName") if brand else None,
            "brand_role": brand.get("role") if brand else None
        }
        
    except Exception as e:
        logger.error(f"Debug error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/debug/collections")
async def debug_collections():
    """
    Debug endpoint to check database collections
    """
    try:
        collections = recommendation_service.db_service.sync_db.list_collection_names()
        
        # Count documents in key collections
        campaign_count = recommendation_service.db_service.sync_db.campaigns.count_documents({})
        user_count = recommendation_service.db_service.sync_db.users.count_documents({})
        brand_count = recommendation_service.db_service.sync_db.users.count_documents({"role": "Brand"})
        influencer_count = recommendation_service.db_service.sync_db.users.count_documents({"role": "Influencer"})
        
        return {
            "collections": collections,
            "document_counts": {
                "campaigns": campaign_count,
                "users": user_count,
                "brands": brand_count,
                "influencers": influencer_count
            }
        }
        
    except Exception as e:
        logger.error(f"Debug collections error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/generate-sample-recommendations")
async def test_generate_sample_recommendations():
    """
    Test endpoint to generate sample recommendations without requiring real brand
    """
    try:
        # Create a mock campaign
        mock_campaign = {
            "_id": "67ddaf469ede7bae5cb17ebb",
            "title": "Test Fashion Campaign",
            "targetAudience": "Young fashion enthusiasts aged 18-25",
            "primaryGoals": ["Brand Awareness", "Fashion"],
            "influencerType": "Micro",
            "budgetRange": 5000,
            "geographicFocus": "United States",
            "collaborationPreferences": {
                "type": "Sponsored Post",
                "styles": ["photo", "video"]
            }
        }
        
        # Create a mock brand
        mock_brand = {
            "_id": "67d36497877c369055ed2c52",
            "companyName": "Test Fashion Brand",
            "industry": "Fashion",
            "bio": "A trendy fashion brand targeting young adults",
            "role": "Brand"
        }
        
        # Generate recommendations using mock data
        recommendation_service_instance = recommendation_service
        
        # Get real influencers from database
        filtered_influencers = recommendation_service_instance._filter_influencers(mock_campaign)
        
        if not filtered_influencers:
            return {
                "message": "No influencers found in database",
                "mock_campaign": mock_campaign,
                "mock_brand": mock_brand
            }
        
        logger.info(f"Found {len(filtered_influencers)} influencers for test")
        
        # Generate prompt
        prompt_data = recommendation_service_instance._create_recommendation_prompt(
            mock_campaign, mock_brand, filtered_influencers
        )
        
        # Get AI recommendations
        ai_response = recommendation_service_instance.openai_client.generate_recommendations(
            user_data=prompt_data["brand_data"],
            target_users=prompt_data["influencer_data"]
        )
        
        # Parse recommendations
        recommendations = recommendation_service_instance._parse_ai_recommendations(
            ai_response, filtered_influencers
        )
        
        return {
            "success": True,
            "recommendations": recommendations,
            "total_influencers_evaluated": len(filtered_influencers),
            "ai_response_raw": ai_response.get("recommendations", "")[:500] + "..." if len(ai_response.get("recommendations", "")) > 500 else ai_response.get("recommendations", ""),
            "ai_usage": ai_response.get("usage"),
            "mock_campaign": mock_campaign,
            "mock_brand": mock_brand
        }
        
    except Exception as e:
        logger.error(f"Error in test recommendation generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@app.post("/test/save-recommendations/{campaign_id}")
async def test_save_recommendations(campaign_id: str):
    """
    Test endpoint to generate and save recommendations to database
    """
    try:
        # Validate ObjectId
        try:
            ObjectId(campaign_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid campaign_id format")
        
        # Get the campaign
        campaign = recommendation_service.db_service.get_campaign(campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Extract brand_id from campaign
        brand_id = campaign.get("brandId") or campaign.get("brand_id")
        if not brand_id:
            raise HTTPException(status_code=400, detail="Campaign has no associated brand")
        
        logger.info(f"Testing recommendations for campaign {campaign_id} with brand {brand_id}")
        
        # Generate recommendations
        result = recommendation_service.generate_campaign_recommendations(campaign_id)
        
        # Verify they were saved to database
        updated_campaign = recommendation_service.db_service.get_campaign(campaign_id)
        saved_recommendations = updated_campaign.get("recommendedInfluencers", []) if updated_campaign else []
        
        return {
            "success": True,
            "campaign_id": campaign_id,
            "brand_id": brand_id,
            "generated_recommendations": len(result.get("recommendations", [])),
            "saved_recommendations": len(saved_recommendations),
            "recommendations_saved_successfully": len(saved_recommendations) > 0,
            "result": result,
            "database_status": {
                "campaign_found": updated_campaign is not None,
                "recommendations_in_db": len(saved_recommendations),
                "last_update": updated_campaign.get("lastRecommendationUpdate") if updated_campaign else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error in test save recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@app.get("/debug/database-info")
async def debug_database_info():
    """Debug endpoint to check database collections and sample data"""
    try:
        db = recommendation_service.db_service.sync_db
        collections = db.list_collection_names()
        
        sample_campaigns = list(db.campaigns.find({}, {"_id": 1, "title": 1, "brandId": 1}).limit(3))
        sample_users = list(db.users.find({}, {"_id": 1, "role": 1, "companyName": 1}).limit(5))
        
        # Convert ObjectIds to strings
        for item in sample_campaigns + sample_users:
            if "_id" in item:
                item["_id"] = str(item["_id"])
            if "brandId" in item:
                item["brandId"] = str(item["brandId"])
        
        role_counts = {role: db.users.count_documents({"role": role}) for role in ["Brand", "Influencer"]}
        
        return {
            "collections": collections,
            "role_counts": role_counts,
            "total_campaigns": db.campaigns.count_documents({}),
            "sample_campaigns": sample_campaigns,
            "sample_users": sample_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/debug/brands")
async def debug_brands():
    """Debug endpoint to check all brands in the users collection"""
    try:
        db = recommendation_service.db_service.sync_db
        brands = list(db.users.find({"role": "Brand"}, {"_id": 1, "companyName": 1, "role": 1}).limit(10))
        
        # Convert ObjectIds to strings
        for brand in brands:
            if "_id" in brand:
                brand["_id"] = str(brand["_id"])
        
        return {
            "total_brands": db.users.count_documents({"role": "Brand"}),
            "sample_brands": brands
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/debug/influencers")
async def debug_influencers():
    """Debug endpoint to check all influencers in the users collection"""
    try:
        db = recommendation_service.db_service.sync_db
        influencers = list(db.users.find(
            {"role": "Influencer"}, 
            {"_id": 1, "username": 1, "role": 1, "categories": 1, "followerCounts": 1}
        ).limit(10))
        
        # Convert ObjectIds to strings
        for influencer in influencers:
            if "_id" in influencer:
                influencer["_id"] = str(influencer["_id"])
        
        return {
            "total_influencers": db.users.count_documents({"role": "Influencer"}),
            "sample_influencers": influencers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/debug/influencer-fields")
async def debug_influencer_fields():
    """Debug endpoint to check all fields in influencer documents"""
    try:
        db = recommendation_service.db_service.sync_db
        influencer = db.users.find_one({"role": "Influencer"})
        
        if influencer:
            # Convert ObjectId to string
            if "_id" in influencer:
                influencer["_id"] = str(influencer["_id"])
            
            return {
                "sample_influencer": influencer,
                "all_fields": list(influencer.keys())
            }
        else:
            return {"error": "No influencers found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/test/simple-recommendation")
async def simple_recommendation_test(follower_min: int = 1000, follower_max: int = 100000):
    """Simple test endpoint to check influencer filtering"""
    try:
        db = recommendation_service.db_service.sync_db
        filter_criteria = {
            "role": "Influencer",
            "followers": {"$gte": follower_min, "$lte": follower_max}
        }
        
        influencers = list(db.users.find(
            filter_criteria,
            {"_id": 1, "username": 1, "followers": 1, "engagement_rate": 1}
        ).limit(5))
        
        # Convert ObjectIds to strings
        for influencer in influencers:
            if "_id" in influencer:
                influencer["_id"] = str(influencer["_id"])
        
        return {
            "filter_criteria": filter_criteria,
            "found_count": len(influencers),
            "sample_influencers": influencers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/debug/campaign-recommendations/{campaign_id}")
async def debug_campaign_recommendations(campaign_id: str):
    """Debug endpoint to check if recommendations were saved to campaign"""
    try:
        db = recommendation_service.db_service.sync_db
        campaign = db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        
        if campaign:
            # Convert ObjectIds to strings
            campaign["_id"] = str(campaign["_id"])
            if "brandId" in campaign:
                campaign["brandId"] = str(campaign["brandId"])
            
            # Check if recommendations exist
            recommendations = campaign.get("recommendedInfluencers", [])
            
            return {
                "campaign_id": campaign_id,
                "campaign_title": campaign.get("title"),
                "has_recommendations": len(recommendations) > 0,
                "recommendation_count": len(recommendations),
                "recommendation_status": campaign.get("recommendationStatus"),
                "last_update": str(campaign.get("lastRecommendationUpdate")) if campaign.get("lastRecommendationUpdate") else None,
                "recommendations": recommendations[:3] if recommendations else []  # Show first 3
            }
        else:
            return {"error": "Campaign not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/test/direct-recommend")
async def test_direct_recommend(campaign_id: str):
    """Test endpoint for direct recommendation generation (not background)"""
    try:
        logger.info(f"Direct recommendation generation for campaign {campaign_id}")
        result = await recommendation_service.generate_campaign_recommendations(campaign_id)
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        logger.error(f"Error in direct recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
