import logging
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from bson import ObjectId
from database_service import database_service
from vector_db_service import vector_db_service
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FeedbackService:
    def __init__(self):
        self.db_service = database_service
        self.vector_db = vector_db_service
    
    def record_recommendation_feedback(self, campaign_id: str, influencer_id: str, 
                                       accepted: bool, feedback_text: Optional[str] = None) -> bool:
        """Record feedback for a recommendation to improve future matches"""
        try:
            # Get campaign and brand info
            campaign = self.db_service.get_campaign(campaign_id)
            if not campaign:
                logger.error(f"Campaign {campaign_id} not found for feedback")
                return False
            
            brand_id = campaign.get("brandId")
            if not brand_id:
                logger.error(f"Campaign {campaign_id} has no brandId for feedback")
                return False
            
            # Store feedback in MongoDB
            feedback_data = {
                "campaign_id": campaign_id,
                "influencer_id": influencer_id,
                "brand_id": brand_id,
                "accepted": accepted,
                "feedback_text": feedback_text,
                "timestamp": datetime.utcnow()
            }
            
            result = self.db_service.sync_db.recommendation_feedback.insert_one(feedback_data)
            
            # If vector DB is enabled, store feedback there too
            if settings.vector_db_enabled:
                self.vector_db.store_recommendation_feedback(
                    campaign_id=campaign_id,
                    influencer_id=influencer_id,
                    brand_id=brand_id,
                    accepted=accepted,
                    feedback_text=feedback_text
                )
            
            # Update campaign recommendation status if accepted
            if accepted:
                self._update_campaign_recommendation_status(campaign_id, influencer_id)
            
            logger.info(f"Recorded feedback for campaign {campaign_id}, influencer {influencer_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error recording recommendation feedback: {str(e)}")
            return False
    
    def _update_campaign_recommendation_status(self, campaign_id: str, influencer_id: str) -> None:
        """Update campaign recommendation status when accepted"""
        try:
            # Find the recommendation in the campaign
            campaign = self.db_service.get_campaign(campaign_id)
            if not campaign:
                return
            
            recommendations = campaign.get("recommendations", [])
            updated_recommendations = []
            
            for rec in recommendations:
                if rec.get("influencer_id") == influencer_id:
                    # Mark this recommendation as accepted
                    rec["status"] = "accepted"
                    rec["accepted_at"] = datetime.utcnow()
                else:
                    # If another recommendation was previously accepted, mark it as replaced
                    if rec.get("status") == "accepted":
                        rec["status"] = "replaced"
                
                updated_recommendations.append(rec)
            
            # Update the campaign with the new recommendation statuses
            self.db_service.sync_db.campaigns.update_one(
                {"_id": ObjectId(campaign_id)},
                {"$set": {"recommendations": updated_recommendations}}
            )
            
        except Exception as e:
            logger.error(f"Error updating campaign recommendation status: {str(e)}")
    
    def get_recommendation_success_rate(self, brand_id: Optional[str] = None) -> Dict[str, Any]:
        """Get success rate of recommendations for analytics"""
        try:
            # Build query
            query = {}
            if brand_id:
                query["brand_id"] = brand_id
            
            # Get all feedback
            all_feedback = list(self.db_service.sync_db.recommendation_feedback.find(query))
            
            if not all_feedback:
                return {
                    "total_recommendations": 0,
                    "accepted_count": 0,
                    "rejected_count": 0,
                    "acceptance_rate": 0.0
                }
            
            # Calculate metrics
            total = len(all_feedback)
            accepted = sum(1 for f in all_feedback if f.get("accepted", False))
            rejected = total - accepted
            acceptance_rate = (accepted / total) * 100 if total > 0 else 0
            
            return {
                "total_recommendations": total,
                "accepted_count": accepted,
                "rejected_count": rejected,
                "acceptance_rate": round(acceptance_rate, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting recommendation success rate: {str(e)}")
            return {
                "total_recommendations": 0,
                "accepted_count": 0,
                "rejected_count": 0,
                "acceptance_rate": 0.0,
                "error": str(e)
            }
    
    def analyze_successful_matches(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Analyze successful matches to improve future recommendations"""
        try:
            # Get successful matches
            successful_matches = list(self.db_service.sync_db.recommendation_feedback.find(
                {"accepted": True}
            ).sort("timestamp", -1).limit(limit))
            
            results = []
            for match in successful_matches:
                campaign_id = match.get("campaign_id")
                influencer_id = match.get("influencer_id")
                
                # Get campaign and influencer details
                campaign = self.db_service.get_campaign(campaign_id)
                influencer = self.db_service.sync_db.users.find_one({"_id": ObjectId(influencer_id)})
                
                if campaign and influencer:
                    # Extract key matching factors
                    match_analysis = {
                        "campaign_id": campaign_id,
                        "campaign_title": campaign.get("title"),
                        "influencer_id": influencer_id,
                        "influencer_name": f"{influencer.get('firstName', '')} {influencer.get('lastName', '')}",
                        "match_timestamp": match.get("timestamp"),
                        "match_factors": self._extract_match_factors(campaign, influencer)
                    }
                    
                    results.append(match_analysis)
            
            return results
            
        except Exception as e:
            logger.error(f"Error analyzing successful matches: {str(e)}")
            return []
    
    def _extract_match_factors(self, campaign: Dict[str, Any], influencer: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key factors that contributed to a successful match"""
        factors = {}
        
        # Audience match
        campaign_audience = campaign.get("targetAudience", "").lower()
        influencer_audience = influencer.get("contentAndAudience", {}).get("audience_demographics", {})
        
        # Content match
        campaign_niche = campaign.get("niche", "").lower()
        influencer_content = influencer.get("contentAndAudience", {}).get("content_types", [])
        
        # Geographic match
        campaign_location = campaign.get("geographicFocus", "").lower()
        influencer_location = influencer.get("location", "").lower()
        
        # Engagement quality
        influencer_engagement = influencer.get("engagement_rate", 0)
        
        # Compile factors
        factors["audience_match"] = self._calculate_text_similarity(campaign_audience, str(influencer_audience))
        factors["content_match"] = self._calculate_text_similarity(campaign_niche, str(influencer_content))
        factors["location_match"] = self._calculate_text_similarity(campaign_location, influencer_location)
        factors["engagement_quality"] = min(influencer_engagement * 100, 100)  # Scale to 0-100
        
        return factors
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple text similarity score"""
        if not text1 or not text2:
            return 0.0
        
        # Convert to lowercase and split into words
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        # Calculate Jaccard similarity
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        if union == 0:
            return 0.0
        
        return round((intersection / union) * 100, 2)

# Create a singleton instance
feedback_service = FeedbackService()