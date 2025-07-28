"""
COVO Recommendation Learning System
Learns from successful campaigns to improve future recommendations
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from database_service import database_service
from redis_service import redis_service

logger = logging.getLogger(__name__)

@dataclass
class CampaignOutcome:
    campaign_id: str
    influencer_id: str
    fit_score: float
    actual_performance: float  # 0-100 based on real metrics
    engagement_rate: float
    conversion_rate: float
    roi: float
    success_metrics: Dict[str, float]

class RecommendationLearningSystem:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.learning_cache_ttl = 86400  # 24 hours
        self.min_data_points = 10  # Minimum campaigns needed for learning
        
    def record_campaign_outcome(self, campaign_outcome: CampaignOutcome):
        """Record the outcome of a campaign for learning"""
        try:
            outcome_data = {
                "campaign_id": campaign_outcome.campaign_id,
                "influencer_id": campaign_outcome.influencer_id,
                "fit_score": campaign_outcome.fit_score,
                "actual_performance": campaign_outcome.actual_performance,
                "engagement_rate": campaign_outcome.engagement_rate,
                "conversion_rate": campaign_outcome.conversion_rate,
                "roi": campaign_outcome.roi,
                "success_metrics": campaign_outcome.success_metrics,
                "recorded_at": datetime.now().isoformat()
            }
            
            # Store in database
            database_service.db.campaign_outcomes.insert_one(outcome_data)
            
            # Invalidate learning cache to trigger retraining
            redis_service.delete("learning:model_weights")
            redis_service.delete("learning:feature_importance")
            
            logger.info(f"Recorded campaign outcome: {campaign_outcome.campaign_id}")
            
        except Exception as e:
            logger.error(f"Error recording campaign outcome: {str(e)}")
    
    def get_learning_insights(self) -> Dict[str, Any]:
        """Get insights from historical campaign data"""
        try:
            # Check cache first
            cached_insights = redis_service.get("learning:insights")
            if cached_insights:
                return cached_insights
            
            # Get recent successful campaigns (last 90 days)
            cutoff_date = datetime.now() - timedelta(days=90)
            
            successful_campaigns = list(database_service.db.campaign_outcomes.find({
                "recorded_at": {"$gte": cutoff_date.isoformat()},
                "actual_performance": {"$gte": 70}  # 70+ performance score
            }))
            
            if len(successful_campaigns) < self.min_data_points:
                return {"status": "insufficient_data", "message": "Need more campaign data for learning"}
            
            insights = self._analyze_successful_patterns(successful_campaigns)
            
            # Cache insights
            redis_service.set("learning:insights", insights, self.learning_cache_ttl)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting learning insights: {str(e)}")
            return {"error": str(e)}
    
    def _analyze_successful_patterns(self, campaigns: List[Dict]) -> Dict[str, Any]:
        """Analyze patterns in successful campaigns"""
        insights = {
            "total_successful_campaigns": len(campaigns),
            "average_performance": np.mean([c["actual_performance"] for c in campaigns]),
            "feature_importance": {},
            "success_patterns": {},
            "recommendations": []
        }
        
        # Analyze engagement rate patterns
        high_engagement = [c for c in campaigns if c["engagement_rate"] > 0.05]
        insights["success_patterns"]["high_engagement_threshold"] = 0.05
        insights["success_patterns"]["high_engagement_success_rate"] = len(high_engagement) / len(campaigns)
        
        # Analyze ROI patterns
        roi_values = [c["roi"] for c in campaigns if c["roi"] > 0]
        if roi_values:
            insights["success_patterns"]["average_roi"] = np.mean(roi_values)
            insights["success_patterns"]["roi_threshold"] = np.percentile(roi_values, 75)
        
        # Feature importance analysis
        insights["feature_importance"] = self._calculate_feature_importance(campaigns)
        
        # Generate actionable recommendations
        insights["recommendations"] = self._generate_learning_recommendations(insights)
        
        return insights
    
    def _calculate_feature_importance(self, campaigns: List[Dict]) -> Dict[str, float]:
        """Calculate which features correlate most with success"""
        importance = {}
        
        performances = [c["actual_performance"] for c in campaigns]
        
        # Correlation with engagement rate
        engagement_rates = [c["engagement_rate"] for c in campaigns]
        if len(set(engagement_rates)) > 1:
            importance["engagement_rate"] = abs(np.corrcoef(performances, engagement_rates)[0, 1])
        
        # Correlation with fit score
        fit_scores = [c["fit_score"] for c in campaigns]
        if len(set(fit_scores)) > 1:
            importance["fit_score"] = abs(np.corrcoef(performances, fit_scores)[0, 1])
        
        # Correlation with ROI
        roi_values = [c.get("roi", 0) for c in campaigns]
        if len(set(roi_values)) > 1 and max(roi_values) > 0:
            importance["roi"] = abs(np.corrcoef(performances, roi_values)[0, 1])
        
        return importance
    
    def _generate_learning_recommendations(self, insights: Dict) -> List[str]:
        """Generate actionable recommendations based on learning"""
        recommendations = []
        
        feature_importance = insights.get("feature_importance", {})
        
        if feature_importance.get("engagement_rate", 0) > 0.5:
            recommendations.append("Prioritize influencers with engagement rates above 5%")
        
        if feature_importance.get("fit_score", 0) > 0.6:
            recommendations.append("AI fit scores are highly predictive - trust the algorithm")
        
        avg_roi = insights.get("success_patterns", {}).get("average_roi", 0)
        if avg_roi > 2.0:
            recommendations.append(f"Target campaigns with projected ROI above {avg_roi:.1f}x")
        
        return recommendations
    
    def enhance_recommendations_with_learning(self, base_recommendations: List[Dict], 
                                            campaign_data: Dict, brand_data: Dict) -> List[Dict]:
        """Enhance recommendations using learned patterns"""
        try:
            insights = self.get_learning_insights()
            
            if insights.get("status") == "insufficient_data":
                return base_recommendations
            
            enhanced_recommendations = []
            feature_importance = insights.get("feature_importance", {})
            
            for rec in base_recommendations:
                enhanced_rec = rec.copy()
                
                # Adjust scores based on learning
                learning_adjustment = 0
                
                # Boost based on engagement rate importance
                if feature_importance.get("engagement_rate", 0) > 0.5:
                    if rec.get("engagement_rate", 0) > 0.05:
                        learning_adjustment += 5
                
                # Boost based on historical ROI patterns
                roi_threshold = insights.get("success_patterns", {}).get("roi_threshold", 0)
                if roi_threshold > 0 and rec.get("estimated_roi", 0) > roi_threshold:
                    learning_adjustment += 3
                
                # Apply learning adjustment
                enhanced_rec["fit_score"] = min(100, rec.get("fit_score", 0) + learning_adjustment)
                enhanced_rec["learning_boosted"] = learning_adjustment > 0
                enhanced_rec["learning_confidence"] = min(1.0, feature_importance.get("fit_score", 0.5))
                
                enhanced_recommendations.append(enhanced_rec)
            
            # Re-sort by enhanced fit score
            enhanced_recommendations.sort(key=lambda x: x["fit_score"], reverse=True)
            
            return enhanced_recommendations
            
        except Exception as e:
            logger.error(f"Error enhancing recommendations with learning: {str(e)}")
            return base_recommendations

# Create learning system instance
learning_system = RecommendationLearningSystem()
