"""
Campaign Learning System for COVO Recommendation Engine
Learns from successful campaigns to improve future recommendations
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import numpy as np
from database_service import database_service
from redis_service import redis_service

logger = logging.getLogger(__name__)

class CampaignLearningSystem:
    def __init__(self):
        self.learning_cache_ttl = 86400  # 24 hours
        self.min_campaigns_for_learning = 5
        
    def record_campaign_outcome(self, campaign_id: str, outcome_data: Dict[str, Any]):
        """Record campaign outcome for learning"""
        try:
            learning_record = {
                "campaign_id": campaign_id,
                "outcome_data": outcome_data,
                "recorded_at": datetime.utcnow(),
                "learning_metrics": self._extract_learning_metrics(outcome_data)
            }
            
            # Store in database
            result = database_service.sync_db.campaign_outcomes.insert_one(learning_record)
            logger.info(f"Campaign outcome recorded: {campaign_id}")
            
            # Invalidate learning cache
            redis_service.delete("campaign_learning:patterns")
            
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error recording campaign outcome: {str(e)}")
            return None
    
    def _extract_learning_metrics(self, outcome_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key metrics for learning from outcome data"""
        metrics = {}
        
        # Success indicators
        metrics['success_score'] = outcome_data.get('success_score', 0)
        metrics['roi'] = outcome_data.get('roi', 0)
        metrics['engagement_rate'] = outcome_data.get('engagement_rate', 0)
        metrics['conversion_rate'] = outcome_data.get('conversion_rate', 0)
        
        # Campaign characteristics
        metrics['budget_efficiency'] = outcome_data.get('budget_efficiency', 0)
        metrics['target_audience_match'] = outcome_data.get('target_audience_match', 0)
        metrics['content_performance'] = outcome_data.get('content_performance', 0)
        
        # Influencer performance
        if 'influencer_performance' in outcome_data:
            inf_perf = outcome_data['influencer_performance']
            metrics['avg_influencer_score'] = np.mean([p.get('score', 0) for p in inf_perf])
            metrics['top_performing_niches'] = [p.get('niche') for p in inf_perf if p.get('score', 0) > 80]
        
        return metrics
    
    def get_learning_insights(self, campaign_type: str, brand_industry: str) -> Dict[str, Any]:
        """Get learning insights for similar campaigns"""
        try:
            cache_key = f"campaign_learning:insights:{campaign_type}:{brand_industry}"
            
            # Check cache
            cached_insights = redis_service.get(cache_key)
            if cached_insights:
                return cached_insights
            
            # Query successful campaigns
            successful_campaigns = list(database_service.sync_db.campaign_outcomes.find({
                "learning_metrics.success_score": {"$gte": 70},
                "outcome_data.campaign_type": campaign_type,
                "outcome_data.brand_industry": brand_industry
            }).limit(50))
            
            if len(successful_campaigns) < self.min_campaigns_for_learning:
                return {"insights": "Insufficient data for learning", "confidence": 0}
            
            insights = self._analyze_patterns(successful_campaigns)
            
            # Cache insights
            redis_service.set(cache_key, insights, self.learning_cache_ttl)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting learning insights: {str(e)}")
            return {"insights": "Error retrieving insights", "confidence": 0}
    
    def _analyze_patterns(self, campaigns: List[Dict]) -> Dict[str, Any]:
        """Analyze patterns from successful campaigns"""
        insights = {
            "total_campaigns_analyzed": len(campaigns),
            "confidence": min(len(campaigns) / 20, 1.0),  # Max confidence at 20+ campaigns
            "patterns": {}
        }
        
        # Analyze metrics
        metrics_data = [c['learning_metrics'] for c in campaigns]
        
        # ROI patterns
        roi_values = [m.get('roi', 0) for m in metrics_data]
        insights['patterns']['avg_roi'] = np.mean(roi_values)
        insights['patterns']['roi_range'] = [np.percentile(roi_values, 25), np.percentile(roi_values, 75)]
        
        # Engagement patterns
        engagement_values = [m.get('engagement_rate', 0) for m in metrics_data]
        insights['patterns']['avg_engagement'] = np.mean(engagement_values)
        
        # Budget efficiency
        budget_efficiency = [m.get('budget_efficiency', 0) for m in metrics_data]
        insights['patterns']['avg_budget_efficiency'] = np.mean(budget_efficiency)
        
        # Top performing niches
        all_niches = []
        for m in metrics_data:
            niches = m.get('top_performing_niches', [])
            all_niches.extend(niches)
        
        niche_counts = {}
        for niche in all_niches:
            if niche:
                niche_counts[niche] = niche_counts.get(niche, 0) + 1
        
        # Sort niches by frequency
        top_niches = sorted(niche_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        insights['patterns']['top_performing_niches'] = top_niches
        
        # Success factors
        insights['recommendations'] = self._generate_recommendations(insights['patterns'])
        
        return insights
    
    def _generate_recommendations(self, patterns: Dict) -> List[str]:
        """Generate actionable recommendations based on patterns"""
        recommendations = []
        
        if patterns.get('avg_roi', 0) > 3:
            recommendations.append(f"Target ROI should be above {patterns['avg_roi']:.1f}x")
        
        if patterns.get('avg_engagement', 0) > 0.05:
            recommendations.append(f"Look for influencers with engagement rates above {patterns['avg_engagement']:.1%}")
        
        if patterns.get('top_performing_niches'):
            top_niche = patterns['top_performing_niches'][0][0]
            recommendations.append(f"Consider focusing on {top_niche} niche based on historical performance")
        
        if patterns.get('avg_budget_efficiency', 0) > 0.7:
            recommendations.append("Optimize for budget efficiency - successful campaigns achieve 70%+ efficiency")
        
        return recommendations
    
    def enhance_recommendations_with_learning(self, base_recommendations: List[Dict], 
                                            campaign_data: Dict, brand_data: Dict) -> List[Dict]:
        """Enhance recommendations using learning insights"""
        try:
            campaign_type = campaign_data.get('collaborationType', 'general')
            brand_industry = brand_data.get('industry', 'general')
            
            insights = self.get_learning_insights(campaign_type, brand_industry)
            
            if insights.get('confidence', 0) < 0.3:
                # Not enough data for learning enhancement
                return base_recommendations
            
            patterns = insights.get('patterns', {})
            enhanced_recommendations = []
            
            for rec in base_recommendations:
                enhanced_rec = rec.copy()
                
                # Apply learning adjustments
                if 'fit_score' in enhanced_rec:
                    # Boost score for historically successful niches
                    inf_niche = enhanced_rec.get('niche', '')
                    top_niches = [n[0] for n in patterns.get('top_performing_niches', [])]
                    
                    if inf_niche in top_niches:
                        learning_boost = 5 + (top_niches.index(inf_niche) * 2)
                        enhanced_rec['fit_score'] = min(100, enhanced_rec['fit_score'] + learning_boost)
                        enhanced_rec['learning_boosted'] = True
                        enhanced_rec['learning_reason'] = f"Historically successful in {inf_niche} campaigns"
                
                # Add learning metadata
                enhanced_rec['learning_insights'] = {
                    'confidence': insights['confidence'],
                    'based_on_campaigns': insights['total_campaigns_analyzed']
                }
                
                enhanced_recommendations.append(enhanced_rec)
            
            # Sort by enhanced scores
            enhanced_recommendations.sort(key=lambda x: x.get('fit_score', 0), reverse=True)
            
            logger.info(f"Enhanced recommendations using {insights['total_campaigns_analyzed']} historical campaigns")
            return enhanced_recommendations
            
        except Exception as e:
            logger.error(f"Error enhancing recommendations with learning: {str(e)}")
            return base_recommendations

# Create learning system instance
learning_system = CampaignLearningSystem()
