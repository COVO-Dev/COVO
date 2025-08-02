import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from bson import ObjectId
from smart_openai_client import smart_openai_client
from database_service import database_service
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.db_service = database_service
        self.openai_client = smart_openai_client

    def generate_campaign_recommendations(self, campaign_id: str) -> Dict[str, Any]:
        """
        Generate AI-powered recommendations for a campaign
        
        Args:
            campaign_id: MongoDB ObjectId of the campaign
            
        Returns:
            Dict containing recommendations and metadata
        """
        try:
            # Set status to processing
            self.db_service.set_campaign_recommendation_status(campaign_id, "processing")
            
            # Fetch campaign and brand data
            campaign = self.db_service.get_campaign(campaign_id)
            if not campaign:
                raise Exception(f"Campaign {campaign_id} not found")
                
            brand_id = campaign.get("brandId")
            if not brand_id:
                raise Exception(f"Campaign {campaign_id} has no brandId")
                
            brand = self.db_service.get_brand(brand_id)
            
            logger.info(f"Campaign data: {campaign is not None}")
            logger.info(f"Brand data: {brand is not None}")
            
            if campaign:
                logger.info(f"Campaign brandId: {campaign.get('brandId')}")
                logger.info(f"Campaign title: {campaign.get('title')}")
            
            if not campaign:
                self.db_service.set_campaign_recommendation_status(campaign_id, "failed")
                logger.error("Campaign not found")
                raise ValueError("Campaign not found")
            
            if not brand:
                logger.warning("Brand not found, creating fallback brand data")
                # Create a fallback brand based on campaign data
                brand = {
                    "_id": brand_id,
                    "companyName": "Unknown Brand",
                    "industry": "General",
                    "bio": f"Brand for campaign: {campaign.get('title', 'Unknown Campaign')}",
                    "role": "Brand"
                }
            
            # Filter influencers based on campaign criteria
            filtered_influencers = self._filter_influencers(campaign)
            
            if not filtered_influencers:
                self.db_service.set_campaign_recommendation_status(campaign_id, "completed")
                return {
                    "recommendations": [],
                    "message": "No suitable influencers found matching campaign criteria",
                    "campaign_id": campaign_id
                }
            
            # Generate dynamic prompt
            prompt_data = self._create_recommendation_prompt(campaign, brand, filtered_influencers)
            
            # Get smart OpenAI recommendations
            ai_response = self.openai_client.generate_smart_recommendations(
                campaign_data=campaign,
                brand_data=brand or {},
                influencers=filtered_influencers
            )
            
            # Parse and format recommendations
            recommendations = self._parse_smart_ai_recommendations(ai_response, filtered_influencers)
            
            # Update campaign with recommendations
            self.db_service.update_campaign_recommendations(campaign_id, recommendations)
            
            return {
                "recommendations": recommendations,
                "campaign_id": campaign_id,
                "total_candidates": len(filtered_influencers),
                "ai_usage": ai_response.get("usage"),
                "message": "Smart recommendations generated successfully"
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendations for campaign {campaign_id}: {str(e)}")
            self.db_service.set_campaign_recommendation_status(campaign_id, "failed")
            raise

    def _filter_influencers(self, campaign: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Intelligently filter influencers based on campaign criteria
        """
        try:
            # Build smart filter query based on campaign requirements
            filter_query = {
                "role": "Influencer"
            }
            
            # 1. Filter by influencer type based on follower count (more precise ranges)
            influencer_type = campaign.get("influencerType")
            if influencer_type:
                follower_ranges = {
                    "Nano": {"$gte": 1000, "$lt": 10000},
                    "Micro": {"$gte": 10000, "$lt": 100000},
                    "Mid-Tier": {"$gte": 100000, "$lt": 500000},
                    "Macro": {"$gte": 500000, "$lt": 1000000},
                    "Celebrity": {"$gte": 1000000}
                }
                if influencer_type in follower_ranges:
                    filter_query["followers"] = follower_ranges[influencer_type]
                    logger.info(f"Filtering by {influencer_type} influencers: {follower_ranges[influencer_type]}")
            
            # 2. Filter by engagement rate (quality check)
            filter_query["engagement_rate"] = {"$gte": 0.01}  # Minimum 1% engagement
            
            # 3. Use intelligent database query with sorting
            query_fields = {
                "_id": 1, 
                "username": 1, 
                "firstName": 1, 
                "lastName": 1,
                "followers": 1, 
                "engagement_rate": 1, 
                "email": 1,
                "location": 1,
                "personalBio": 1,
                "covoScore": 1,
                "contentAndAudience": 1
            }
            
            # Get influencers with intelligent sorting
            logger.info(f"Querying with filter: {filter_query}")
            
            # First, get all matching influencers
            all_influencers = list(self.db_service.sync_db.users.find(
                filter_query, query_fields
            ).sort([
                ("engagement_rate", -1),  # Higher engagement first
                ("followers", -1)         # Then by followers
            ]).limit(50))  # Get more candidates for better selection
            
            logger.info(f"Found {len(all_influencers)} total candidates")
            
            # 4. Apply campaign-specific intelligent filtering
            filtered_influencers = self._apply_campaign_specific_filtering(
                all_influencers, campaign
            )
            
            logger.info(f"After campaign-specific filtering: {len(filtered_influencers)} influencers")
            
            # Convert ObjectIds to strings
            for inf in filtered_influencers:
                inf["_id"] = str(inf["_id"])
            
            return filtered_influencers[:20]  # Return top 20 for AI analysis
            
        except Exception as e:
            logger.error(f"Error filtering influencers: {str(e)}")
            return []

    def _apply_campaign_specific_filtering(self, influencers: List[Dict], campaign: Dict[str, Any]) -> List[Dict]:
        """Apply campaign-specific intelligent filtering"""
        try:
            filtered = []
            
            # Get campaign criteria
            target_audience = campaign.get("targetAudience", "").lower()
            primary_goals = [goal.lower() for goal in campaign.get("primaryGoals", [])]
            geographic_focus = campaign.get("geographicFocus", "").lower()
            budget_range = campaign.get("budgetRange", 0)
            
            for inf in influencers:
                score = 0
                reasons = []
                
                # 1. Engagement quality scoring
                engagement = inf.get("engagement_rate", 0)
                if engagement > 0.05:
                    score += 30
                    reasons.append("High engagement rate")
                elif engagement > 0.02:
                    score += 20
                    reasons.append("Good engagement rate")
                elif engagement > 0.01:
                    score += 10
                    reasons.append("Moderate engagement")
                
                # 2. Follower count vs budget alignment
                followers = inf.get("followers", 0)
                if budget_range > 0:
                    # Rough cost estimation (micro: $100-1000, macro: $1000+)
                    estimated_cost = self._estimate_collaboration_cost(followers)
                    if estimated_cost <= budget_range:
                        score += 25
                        reasons.append("Within budget range")
                    elif estimated_cost <= budget_range * 1.2:  # 20% flexibility
                        score += 15
                        reasons.append("Close to budget")
                
                # 3. Bio/content relevance (basic keyword matching)
                bio = inf.get("personalBio", "").lower()
                content_match = False
                for goal in primary_goals:
                    if goal in bio:
                        score += 20
                        content_match = True
                        reasons.append(f"Bio mentions {goal}")
                        break
                
                # 4. Geographic relevance
                if geographic_focus and geographic_focus != "global":
                    location = inf.get("location", {})
                    if isinstance(location, dict):
                        country = location.get("country", "").lower()
                        city = location.get("city", "").lower()
                        if geographic_focus in country or geographic_focus in city:
                            score += 15
                            reasons.append("Geographic match")
                
                # 5. COVO score bonus
                covo_score = inf.get("covoScore", {})
                if isinstance(covo_score, dict):
                    overall_score = covo_score.get("overall", 0)
                    if overall_score > 80:
                        score += 10
                        reasons.append("High COVO score")
                
                # Add score and reasons to influencer data for debugging
                inf["_filter_score"] = score
                inf["_filter_reasons"] = reasons
                
                # Only include influencers with minimum score
                if score >= 25:  # Minimum threshold
                    filtered.append(inf)
            
            # Sort by score (highest first)
            filtered.sort(key=lambda x: x.get("_filter_score", 0), reverse=True)
            
            logger.info(f"Top filtered influencers scores: {[inf.get('_filter_score', 0) for inf in filtered[:5]]}")
            
            return filtered
            
        except Exception as e:
            logger.error(f"Error in campaign-specific filtering: {str(e)}")
            return influencers  # Return original list if filtering fails

    def _estimate_collaboration_cost(self, followers: int) -> int:
        """Estimate collaboration cost based on follower count"""
        if followers < 10000:
            return 100 + (followers * 0.01)  # $100-200 for nano
        elif followers < 100000:
            return 200 + (followers * 0.005)  # $200-700 for micro
        elif followers < 500000:
            return 700 + (followers * 0.002)  # $700-1700 for mid-tier
        elif followers < 1000000:
            return 1700 + (followers * 0.001)  # $1700-2700 for macro
        else:
            return 2700 + (followers * 0.0005)  # $2700+ for celebrity

    def _create_recommendation_prompt(self, campaign: Dict[str, Any], brand: Dict[str, Any], 
                                    influencers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create dynamic prompt data based on campaign and brand info
        """
        # Format brand data for prompt
        brand_data = {
            "role": "Brand",
            "companyName": brand.get("companyName", "Unknown"),
            "industry": brand.get("industry", ""),
            "bio": brand.get("bio", ""),
            "campaign": {
                "title": campaign.get("title", ""),
                "targetAudience": campaign.get("targetAudience", ""),
                "primaryGoals": campaign.get("primaryGoals", []),
                "influencerType": campaign.get("influencerType", ""),
                "budgetRange": campaign.get("budgetRange", 0),
                "geographicFocus": campaign.get("geographicFocus", ""),
                "collaborationType": campaign.get("collaborationPreferences", {}).get("type", ""),
                "styles": campaign.get("collaborationPreferences", {}).get("styles", [])
            }
        }
        
        # Format influencer data for prompt (short format to save tokens)
        influencer_data = []
        for inf in influencers:
            inf_data = {
                "id": str(inf["_id"]),
                "username": inf.get("username", ""),
                "name": f"{inf.get('firstName', '')} {inf.get('lastName', '')}".strip(),
                "followers": inf.get("followers", 0),
                "engagement_rate": inf.get("engagement_rate", 0),
                "location": f"{inf.get('location', {}).get('city', '')}, {inf.get('location', {}).get('country', '')}".strip(", "),
                "bio": inf.get("personalBio", "")[:100] if inf.get("personalBio") else "",
                "covoScore": inf.get("covoScore", {}).get("overall", 0)
            }
            influencer_data.append(inf_data)
        
        return {
            "brand_data": brand_data,
            "influencer_data": influencer_data
        }

    def _parse_ai_recommendations(self, ai_response: Dict[str, Any], 
                                influencers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse OpenAI response and format recommendations with detailed output
        """
        try:
            recommendations_text = ai_response.get("recommendations", "")
            
            # Try to parse JSON response from OpenAI
            try:
                parsed_response = json.loads(recommendations_text)
                ai_recommendations = parsed_response.get("recommendations", [])
            except json.JSONDecodeError:
                # If not JSON, use fallback with enhanced details
                logger.warning("Could not parse JSON from OpenAI response, using enhanced fallback")
                ai_recommendations = []
                for i, inf in enumerate(influencers[:5]):  # Top 5 influencers
                    # Generate varied confidence scores and detailed reasoning
                    base_score = 0.75 - (i * 0.05)  # Decreasing confidence
                    engagement_bonus = min(inf.get("engagement_rate", 0) * 0.2, 0.15)
                    follower_factor = min(inf.get("followers", 0) / 100000 * 0.1, 0.1)
                    
                    confidence = min(base_score + engagement_bonus + follower_factor, 0.95)
                    
                    # Create detailed reasoning
                    reasoning_parts = [
                        f"Strong match with {inf.get('followers', 0):,} followers in target range",
                        f"Engagement rate of {inf.get('engagement_rate', 0):.1%} indicates active audience",
                        "Profile demographics align with campaign goals"
                    ]
                    
                    # Add collaboration suggestions
                    collaboration_types = [
                        "Sponsored Instagram post with brand integration",
                        "Product review and unboxing content",
                        "Brand ambassador partnership",
                        "Story takeover and behind-the-scenes content",
                        "Collaborative giveaway campaign"
                    ]
                    
                    ai_recommendations.append({
                        "username": inf.get("username", ""),
                        "confidence_score": confidence,
                        "reasoning": ". ".join(reasoning_parts),
                        "potential_collaboration": collaboration_types[i % len(collaboration_types)],
                        "estimated_reach": inf.get("followers", 0),
                        "audience_quality": "High" if inf.get("engagement_rate", 0) > 0.05 else "Medium"
                    })
            
            # Match AI recommendations with full influencer data
            formatted_recommendations = []
            influencer_map = {inf["username"]: inf for inf in influencers}
            
            for rec in ai_recommendations:
                username = rec.get("username", "")
                if username in influencer_map:
                    inf_data = influencer_map[username]
                    formatted_rec = {
                        "influencer": {
                            "_id": str(inf_data["_id"]),
                            "username": inf_data.get("username", ""),
                            "firstName": inf_data.get("firstName", ""),
                            "lastName": inf_data.get("lastName", ""),
                            "followers": inf_data.get("followers", 0),
                            "engagement_rate": inf_data.get("engagement_rate", 0),
                            "contentAndAudience": inf_data.get("contentAndAudience", {}),
                            "location": inf_data.get("location", {}),
                            "covoScore": inf_data.get("covoScore", {})
                        },
                        "confidence_score": round(rec.get("confidence_score", 0.5), 3),
                        "recommendationScore": int(rec.get("confidence_score", 0.5) * 100),
                        "reasoning": rec.get("reasoning", "Standard recommendation based on campaign criteria"),
                        "potential_collaboration": rec.get("potential_collaboration", "General influencer partnership"),
                        "estimated_reach": rec.get("estimated_reach", inf_data.get("followers", 0)),
                        "audience_quality": rec.get("audience_quality", "Medium"),
                        "aiGenerated": True,
                        "generatedAt": datetime.utcnow().isoformat()
                    }
                    formatted_recommendations.append(formatted_rec)
            
            return formatted_recommendations
            
        except Exception as e:
            logger.error(f"Error parsing AI recommendations: {str(e)}")
            return []

    def _parse_smart_ai_recommendations(self, ai_response: Dict[str, Any], influencers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse smart AI recommendations from the optimized client"""
        try:
            ai_content = ai_response.get("ai_response", "")
            
            # Parse JSON response
            try:
                ai_data = json.loads(ai_content)
            except json.JSONDecodeError:
                logger.warning("Failed to parse AI JSON response, using fallback")
                return self._create_fallback_recommendations(influencers)
            
            # Get AI recommendations
            ai_recommendations = ai_data.get("recommendations", [])
            
            # Create influencer lookup map
            influencer_map = {str(inf["_id"]): inf for inf in influencers}
            influencer_username_map = {inf.get("username", ""): inf for inf in influencers}
            
            formatted_recommendations = []
            
            for rec in ai_recommendations:
                # Find influencer by ID or username
                influencer = None
                inf_id = rec.get("influencer_id", "")
                username = rec.get("username", "")
                
                if inf_id in influencer_map:
                    influencer = influencer_map[inf_id]
                elif username in influencer_username_map:
                    influencer = influencer_username_map[username]
                
                if influencer:
                    # Calculate enhanced metrics
                    confidence_score = rec.get("confidence_score", rec.get("fit_score", 70) / 100)
                    
                    formatted_rec = {
                        "influencer": {
                            "_id": str(influencer["_id"]),
                            "username": influencer.get("username", ""),
                            "firstName": influencer.get("firstName", ""),
                            "lastName": influencer.get("lastName", ""),
                            "followers": influencer.get("followers", 0),
                            "engagement_rate": influencer.get("engagement_rate", 0),
                            "contentAndAudience": influencer.get("contentAndAudience", {}),
                            "location": influencer.get("location", {}),
                            "covoScore": influencer.get("covoScore", 0)
                        },
                        "confidence_score": round(confidence_score, 3),
                        "recommendationScore": int(confidence_score * 100),
                        "reasoning": rec.get("reasoning", "AI-generated recommendation based on campaign analysis"),
                        "collaboration_types": rec.get("collaboration_types", ["Sponsored Posts"]),
                        "potential_collaboration": ", ".join(rec.get("collaboration_types", ["General collaboration"])),
                        "estimated_reach": rec.get("estimated_reach", influencer.get("followers", 0)),
                        "risk_level": rec.get("risk_level", "Medium"),
                        "fit_score": rec.get("fit_score", int(confidence_score * 100)),
                        "aiGenerated": True,
                        "generatedAt": datetime.utcnow().isoformat(),
                        "ai_analysis": {
                            "campaign_fit": rec.get("fit_score", 0),
                            "engagement_quality": "High" if influencer.get("engagement_rate", 0) > 0.05 else "Medium",
                            "audience_alignment": "Strong" if confidence_score > 0.8 else "Moderate",
                            "content_relevance": "High" if confidence_score > 0.7 else "Medium"
                        }
                    }
                    formatted_recommendations.append(formatted_rec)
            
            # If no recommendations were parsed, use fallback
            if not formatted_recommendations:
                logger.warning("No AI recommendations parsed, using fallback")
                return self._create_fallback_recommendations(influencers)
            
            logger.info(f"Successfully parsed {len(formatted_recommendations)} smart AI recommendations")
            return formatted_recommendations
            
        except Exception as e:
            logger.error(f"Error parsing smart AI recommendations: {str(e)}")
            return self._create_fallback_recommendations(influencers)

    def _create_fallback_recommendations(self, influencers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create fallback recommendations when AI parsing fails"""
        try:
            # Sort by engagement rate and followers
            sorted_influencers = sorted(
                influencers,
                key=lambda x: (x.get("engagement_rate", 0) * 0.7 + (x.get("followers", 0) / 1000000) * 0.3),
                reverse=True
            )
            
            recommendations = []
            for i, inf in enumerate(sorted_influencers[:5]):  # Top 5
                confidence = 0.8 - (i * 0.1)  # Decreasing confidence
                
                formatted_rec = {
                    "influencer": {
                        "_id": str(inf["_id"]),
                        "username": inf.get("username", ""),
                        "firstName": inf.get("firstName", ""),
                        "lastName": inf.get("lastName", ""),
                        "followers": inf.get("followers", 0),
                        "engagement_rate": inf.get("engagement_rate", 0),
                        "contentAndAudience": inf.get("contentAndAudience", {}),
                        "location": inf.get("location", {}),
                        "covoScore": inf.get("covoScore", 0)
                    },
                    "confidence_score": round(confidence, 3),
                    "recommendationScore": int(confidence * 100),
                    "reasoning": f"Fallback recommendation: Strong engagement rate ({inf.get('engagement_rate', 0):.1%}) with {inf.get('followers', 0):,} followers",
                    "collaboration_types": ["Sponsored Posts", "Story Features"],
                    "potential_collaboration": "General influencer partnership",
                    "estimated_reach": inf.get("followers", 0),
                    "risk_level": "Medium",
                    "fit_score": int(confidence * 100),
                    "aiGenerated": False,
                    "generatedAt": datetime.utcnow().isoformat(),
                    "fallback": True
                }
                recommendations.append(formatted_rec)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error creating fallback recommendations: {str(e)}")
            return []

# Create global instance
recommendation_service = RecommendationService()