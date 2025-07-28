import openai
from openai import OpenAI
from config import settings
import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import asyncio
from asyncio import Semaphore
import hashlib

# Import Redis service for caching
from redis_service import redis_service

# Import learning and semantic search systems
from campaign_learning import learning_system
from semantic_search_engine import semantic_search

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SmartOpenAIClient:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature
        
        # Rate limiting configuration with async support
        self.request_count = 0
        self.last_request_time = time.time()
        self.rate_limit = settings.api_rate_limit  # Requests per minute
        self.rate_limit_window = settings.api_rate_limit_window  # Window in seconds
        self.semaphore = Semaphore(10)  # Max 10 concurrent requests
        
        # Cache configuration
        self.use_cache = redis_service.is_connected()
        self.cache_ttl = settings.redis_ttl  # Cache TTL in seconds
        
        # Performance tracking
        self.metrics = {
            "total_requests": 0,
            "cache_hits": 0,
            "total_tokens": 0,
            "total_cost": 0.0,
            "learning_enhanced": 0,
            "semantic_enhanced": 0
        }
        
        logger.info(f"Initialized Enhanced OpenAI client with model: {self.model}")
        logger.info(f"Rate limit: {self.rate_limit} requests per {self.rate_limit_window} seconds")
        logger.info("Learning system and semantic search enabled")
        if self.use_cache:
            logger.info(f"Redis cache enabled for OpenAI client with TTL: {self.cache_ttl} seconds")
        else:
            logger.warning("Redis cache not available, proceeding without caching")
        
    def _check_rate_limit(self):
        """Check and enforce rate limits"""
        current_time = time.time()
        time_passed = current_time - self.last_request_time
        
        # Reset counter if window has passed
        if time_passed > self.rate_limit_window:
            self.request_count = 0
            self.last_request_time = current_time
            return
        
        # Check if we've hit the rate limit
        if self.request_count >= self.rate_limit:
            # Calculate sleep time to respect rate limit
            sleep_time = self.rate_limit_window - time_passed
            if sleep_time > 0:
                logger.warning(f"Rate limit reached. Waiting {sleep_time:.2f} seconds")
                time.sleep(sleep_time)
                self.request_count = 0
                self.last_request_time = time.time()
        
    def _create_enhanced_cache_key(self, campaign_data, brand_data, influencers):
        """Create more robust cache key with version control"""
        key_data = {
            "campaign_id": campaign_data.get("_id"),
            "brand_id": brand_data.get("_id"), 
            "influencer_ids": sorted([str(inf.get("_id")) for inf in influencers]),
            "model": self.model,
            "version": "v3.0",  # Updated version for enhanced system
            "learning_enabled": True,
            "semantic_enabled": True
        }
        # Use SHA256 instead of hash() for consistency across processes
        key_string = json.dumps(key_data, sort_keys=True)
        return f"openai:enhanced_recs:{hashlib.sha256(key_string.encode()).hexdigest()[:16]}"
        
    def _calculate_cost(self, usage) -> float:
        """Calculate estimated cost based on token usage"""
        if not usage:
            return 0
            
        # Get token counts
        input_tokens = usage.prompt_tokens
        output_tokens = usage.completion_tokens
        
        # Approximate cost calculation (adjust rates as needed)
        # These rates are approximate and may change based on OpenAI's pricing
        if self.model.startswith("gpt-4"):
            input_cost = input_tokens * 0.00003  # $0.03 per 1K tokens
            output_cost = output_tokens * 0.00006  # $0.06 per 1K tokens
        else:  # GPT-3.5 models
            input_cost = input_tokens * 0.00001  # $0.01 per 1K tokens
            output_cost = output_tokens * 0.00002  # $0.02 per 1K tokens
        
        total_cost = input_cost + output_cost
        return round(total_cost, 4)
    
    def generate_enhanced_recommendations(self, campaign_data: Dict[str, Any], brand_data: Dict[str, Any], influencers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate intelligent recommendations with learning and semantic enhancement"""
        try:
            self.metrics["total_requests"] += 1
            
            # Create enhanced cache key
            if self.use_cache:
                cache_key = self._create_enhanced_cache_key(campaign_data, brand_data, influencers)
                
                # Check cache
                cached_response = redis_service.get(cache_key)
                if cached_response:
                    self.metrics["cache_hits"] += 1
                    logger.info(f"Cache hit for enhanced recommendations")
                    return cached_response
            
            # Step 1: Apply semantic search enhancement
            logger.info("Applying semantic search enhancement...")
            enhanced_influencers = semantic_search.enhance_influencer_matching(
                campaign_data, brand_data, influencers
            )
            self.metrics["semantic_enhanced"] += 1
            
            # Step 2: Generate AI recommendations with enhanced data
            ai_recommendations = self._generate_ai_recommendations(
                campaign_data, brand_data, enhanced_influencers
            )
            
            # Step 3: Apply learning system enhancement
            logger.info("Applying learning system enhancement...")
            learned_recommendations = learning_system.enhance_recommendations_with_learning(
                ai_recommendations, campaign_data, brand_data
            )
            self.metrics["learning_enhanced"] += 1
            
            # Step 4: Get learning insights
            campaign_type = campaign_data.get('collaborationType', 'general')
            brand_industry = brand_data.get('industry', 'general')
            learning_insights = learning_system.get_learning_insights(campaign_type, brand_industry)
            
            # Step 5: Compile final result
            result = {
                "ai_response": json.dumps({
                    "recommendations": learned_recommendations[:5],  # Top 5
                    "total_analyzed": len(enhanced_influencers),
                    "semantic_enhanced": True,
                    "learning_enhanced": True,
                    "learning_insights": learning_insights.get("recommendations", [])
                }),
                "usage": self._get_estimated_usage(),
                "enhancement_metadata": {
                    "semantic_similarity_applied": True,
                    "learning_system_applied": True,
                    "cache_used": False,
                    "processed_at": datetime.now().isoformat()
                }
            }
            
            # Cache the result
            if self.use_cache:
                result_with_metadata = {
                    **result,
                    "_cache_metadata": {
                        "cached_at": datetime.now().isoformat(),
                        "model": "enhanced_system_v3.0",
                        "semantic_enhanced": True,
                        "learning_enhanced": True
                    }
                }
                redis_service.set(cache_key, result_with_metadata, self.cache_ttl)
                logger.info(f"Cached enhanced recommendations")
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating enhanced recommendations: {str(e)}")
            # Fallback to original method
            return self.generate_smart_recommendations(campaign_data, brand_data, influencers)
    
    def _generate_ai_recommendations(self, campaign_data: Dict[str, Any], brand_data: Dict[str, Any], influencers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate AI recommendations with semantic-enhanced data"""
        try:
            # Check rate limits
            self._check_rate_limit()
            
            # Create optimized prompts
            system_prompt = self._create_enhanced_system_prompt()
            user_prompt = self._create_semantic_enhanced_user_prompt(campaign_data, brand_data, influencers)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            # Update metrics
            if response.usage:
                self.metrics["total_tokens"] += response.usage.total_tokens
                self.metrics["total_cost"] += self._calculate_cost(response.usage)
            
            # Parse AI response
            ai_response = json.loads(response.choices[0].message.content)
            return ai_response.get("recommendations", [])
            
        except Exception as e:
            logger.error(f"Error in AI recommendation generation: {str(e)}")
            return []
    
    def _create_enhanced_system_prompt(self) -> str:
        """Enhanced system prompt with learning and semantic awareness"""
        return """You are COVO's advanced AI recommendation engine with learning capabilities and semantic understanding.

TASK: Analyze campaign requirements and rank influencers by enhanced fit score (0-100).

ENHANCED EVALUATION CRITERIA:
1. Semantic Similarity (35%): Deep content and audience alignment using NLP
2. Historical Performance (25%): Learning from past successful campaigns
3. Engagement Quality (20%): Authentic engagement rate and audience interaction  
4. Brand Safety (15%): Content appropriateness, values alignment
5. Growth Potential (5%): Future collaboration opportunities

SPECIAL CONSIDERATIONS:
- Semantic scores indicate deep content alignment
- Learning-boosted scores reflect historical success patterns
- Enhanced COVO scores combine multiple intelligence layers

OUTPUT FORMAT (JSON only):
{
  "recommendations": [
    {
      "influencer_id": "string",
      "username": "string", 
      "fit_score": 92,
      "confidence_score": 0.95,
      "semantic_similarity": 0.78,
      "learning_boost": 5,
      "reasoning": "Combines high semantic alignment with proven track record",
      "collaboration_types": ["Sponsored Posts", "Story Features"],
      "estimated_reach": 150000,
      "risk_level": "Low",
      "growth_potential": "High"
    }
  ],
  "campaign_summary": "Enhanced analysis with learning insights",
  "total_analyzed": 10,
  "enhancement_level": "maximum"
}

Prioritize influencers with high semantic similarity AND learning validation. Maximum 5 recommendations."""

    def _create_semantic_enhanced_user_prompt(self, campaign_data: Dict[str, Any], brand_data: Dict[str, Any], influencers: List[Dict[str, Any]]) -> str:
        """Create user prompt with semantic-enhanced influencer data"""
        
        # Get basic campaign/brand info
        campaign_summary = {
            'title': campaign_data.get('title', 'Untitled'),
            'objectives': campaign_data.get('primaryGoals', []),
            'target_audience': campaign_data.get('targetAudience', 'General'),
            'budget': campaign_data.get('budgetRange', 0),
            'niche': campaign_data.get('niche', 'General'),
            'location': campaign_data.get('geographicFocus', 'Global')
        }
        
        brand_summary = {
            'name': brand_data.get('companyName', 'Unknown Brand'),
            'industry': brand_data.get('industry', 'General'),
            'values': brand_data.get('bio', '')[:100] if brand_data.get('bio') else 'No description'
        }
        
        # Format enhanced influencer profiles
        enhanced_profiles = []
        for inf in influencers[:12]:  # Increased limit due to better data
            profile = {
                'id': str(inf.get('_id', '')),
                'username': inf.get('username', 'unknown'),
                'followers': inf.get('followers', 0),
                'engagement_rate': inf.get('engagement_rate', 0),
                'enhanced_covo_score': inf.get('enhanced_covo_score', inf.get('covoScore', 0)),
                'semantic_similarity': inf.get('semantic_similarity', 0),
                'semantic_boosted': inf.get('semantic_boosted', False),
                'niche': self._extract_niche(inf),
                'location': self._extract_location(inf)
            }
            enhanced_profiles.append(profile)
        
        return f"""ENHANCED CAMPAIGN ANALYSIS
Campaign: {campaign_summary['title']}
Brand: {brand_summary['name']} ({brand_summary['industry']})
Target Audience: {campaign_summary['target_audience']}
Budget: ${campaign_summary['budget']:,}
Geographic Focus: {campaign_summary['location']}

BRAND VALUES: {brand_summary['values']}

SEMANTICALLY ENHANCED INFLUENCERS:
{self._format_enhanced_influencer_list(enhanced_profiles)}

ANALYSIS INSTRUCTIONS:
- Prioritize influencers with semantic_similarity > 0.3
- Consider enhanced_covo_score (combines original + semantic)
- Factor in semantic_boosted flag for content alignment
- Balance reach with engagement quality
- Recommend based on deep content and audience match"""

    def _format_enhanced_influencer_list(self, influencers: List[Dict[str, Any]]) -> str:
        """Format enhanced influencer list with semantic data"""
        formatted = []
        for inf in influencers:
            semantic_flag = "🔥" if inf.get('semantic_boosted') else ""
            formatted.append(
                f"ID:{inf['id']} @{inf['username']} {semantic_flag}| "
                f"{inf['followers']:,} followers | {inf['engagement_rate']:.1%} engagement | "
                f"Enhanced Score:{inf['enhanced_covo_score']:.1f} | "
                f"Semantic:{inf['semantic_similarity']:.2f} | "
                f"{inf['niche']} | {inf['location']}"
            )
        return '\n'.join(formatted)
    
    def _extract_location(self, influencer: Dict[str, Any]) -> str:
        """Extract location information"""
        location = influencer.get('location', {})
        if isinstance(location, dict):
            return location.get('country', 'Unknown')
        return str(location) if location else 'Unknown'
    
    def _get_estimated_usage(self) -> Dict[str, Any]:
        """Get estimated token usage for enhanced system"""
        return {
            "estimated_prompt_tokens": 800,  # Higher due to enhanced data
            "estimated_completion_tokens": 400,
            "estimated_total_tokens": 1200,
            "estimated_cost": 0.024,  # gpt-4o-mini pricing
            "enhancement_overhead": "15%"
        }
    
    def _create_optimized_user_prompt(self, campaign_data: Dict[str, Any], brand_data: Dict[str, Any], influencers: List[Dict[str, Any]]) -> str:
        """Create optimized user prompt with essential data only"""
        
        # Extract key campaign data
        campaign_summary = {
            'title': campaign_data.get('title', 'Untitled'),
            'objectives': campaign_data.get('primaryGoals', []),
            'target_audience': campaign_data.get('targetAudience', 'General'),
            'budget': campaign_data.get('budgetRange', 0),
            'niche': campaign_data.get('niche', 'General'),
            'location': campaign_data.get('geographicFocus', 'Global'),
            'collaboration_type': campaign_data.get('collaborationType', 'Sponsored Posts')
        }
        
        # Extract key brand data
        brand_summary = {
            'name': brand_data.get('companyName', 'Unknown Brand'),
            'industry': brand_data.get('industry', 'General'),
            'values': brand_data.get('bio', '')[:100] if brand_data.get('bio') else 'No description'
        }
        
        # Create concise influencer profiles
        influencer_profiles = []
        for inf in influencers[:10]:  # Limit to top 10 for efficiency
            profile = {
                'id': str(inf.get('_id', '')),
                'username': inf.get('username', 'unknown'),
                'followers': inf.get('followers', 0),
                'engagement_rate': inf.get('engagement_rate', 0),
                'location': inf.get('location', {}).get('country', 'Unknown') if isinstance(inf.get('location'), dict) else inf.get('location', 'Unknown'),
                'niche': self._extract_niche(inf),
                'bio': inf.get('bio', '')[:80] if inf.get('bio') else 'No bio',
                'covo_score': inf.get('covoScore', 0),
                'verified': inf.get('verified', False)
            }
            influencer_profiles.append(profile)
        
        return f"""CAMPAIGN: {campaign_summary['title']}
BRAND: {brand_summary['name']} ({brand_summary['industry']})
TARGET: {campaign_summary['target_audience']}
BUDGET: ${campaign_summary['budget']:,}
NICHE: {campaign_summary['niche']}
LOCATION: {campaign_summary['location']}
COLLABORATION: {campaign_summary['collaboration_type']}

BRAND VALUES: {brand_summary['values']}

INFLUENCERS TO ANALYZE:
{self._format_influencer_list(influencer_profiles)}

Rank by best fit for this specific campaign and brand combination. Consider niche alignment, audience match, and engagement quality."""
    
    def _extract_niche(self, influencer: Dict[str, Any]) -> str:
        """Extract influencer niche from available data"""
        # Check content and audience data
        content_data = influencer.get('contentAndAudience', {})
        if content_data:
            primary_niche = content_data.get('primaryNiche', '')
            if primary_niche:
                return primary_niche
        
        # Fallback to bio analysis
        bio = influencer.get('bio', '').lower()
        niche_keywords = {
            'Fashion': ['fashion', 'style', 'outfit', 'clothing'],
            'Fitness': ['fitness', 'workout', 'gym', 'health'],
            'Food': ['food', 'recipe', 'cooking', 'chef'],
            'Travel': ['travel', 'adventure', 'explore'],
            'Beauty': ['beauty', 'makeup', 'skincare'],
            'Tech': ['tech', 'technology', 'gadget'],
            'Lifestyle': ['lifestyle', 'life', 'daily'],
            'Business': ['entrepreneur', 'business', 'startup']
        }
        
        for niche, keywords in niche_keywords.items():
            if any(keyword in bio for keyword in keywords):
                return niche
        
        return 'General'
    
    def _format_influencer_list(self, influencers: List[Dict[str, Any]]) -> str:
        """Format influencer list for efficient processing"""
        formatted = []
        for inf in influencers:
            formatted.append(
                f"ID:{inf['id']} @{inf['username']} | {inf['followers']:,} followers | "
                f"{inf['engagement_rate']:.1%} engagement | {inf['niche']} | "
                f"{inf['location']} | Score:{inf['covo_score']}"
            )
        return '\n'.join(formatted)
    
    def record_campaign_outcome(self, campaign_id: str, influencer_id: str, 
                              fit_score: float, actual_performance: float,
                              engagement_rate: float, conversion_rate: float = 0,
                              roi: float = 0, success_metrics: Dict[str, float] = None):
        """Record campaign outcome for learning system"""
        try:
            from recommendation_learning_system import CampaignOutcome
            
            outcome = CampaignOutcome(
                campaign_id=campaign_id,
                influencer_id=influencer_id,
                fit_score=fit_score,
                actual_performance=actual_performance,
                engagement_rate=engagement_rate,
                conversion_rate=conversion_rate,
                roi=roi,
                success_metrics=success_metrics or {}
            )
            
            learning_system.record_campaign_outcome(outcome)
            logger.info(f"Recorded campaign outcome for learning: {campaign_id}")
            
        except Exception as e:
            logger.error(f"Error recording campaign outcome: {str(e)}")
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        total_requests = max(self.metrics["total_requests"], 1)
        
        return {
            "system_metrics": self.metrics,
            "performance_ratios": {
                "cache_hit_rate": self.metrics["cache_hits"] / total_requests,
                "avg_tokens_per_request": self.metrics["total_tokens"] / total_requests,
                "avg_cost_per_request": self.metrics["total_cost"] / total_requests,
                "enhancement_usage_rate": {
                    "semantic": self.metrics["semantic_enhanced"] / total_requests,
                    "learning": self.metrics["learning_enhanced"] / total_requests
                }
            },
            "learning_insights": {"message": "Use get_learning_insights(campaign_type, brand_industry) for specific insights"},
            "recommendations": [
                "Monitor cache hit rate for optimization opportunities",
                "Track semantic enhancement impact on accuracy",
                "Measure learning system effectiveness over time"
            ]
        }
    
    def semantic_search_influencers(self, query: str, influencer_pool: List[Dict[str, Any]], 
                                  top_k: int = 20) -> List[Tuple[Dict[str, Any], float]]:
        """Public interface for semantic search"""
        return semantic_search.semantic_search_influencers(query, influencer_pool, top_k)
    
    def find_similar_successful_influencers(self, target_influencer: Dict[str, Any],
                                          candidate_pool: List[Dict[str, Any]], 
                                          campaign_type: str = "general",
                                          brand_industry: str = "general") -> List[Dict[str, Any]]:
        """Find influencers similar to successful ones using learning + semantic search"""
        try:
            # Get historical successful influencer patterns
            insights = learning_system.get_learning_insights(campaign_type, brand_industry)
            
            # Find semantically similar influencers
            similar_influencers = semantic_search.find_similar_influencers(
                target_influencer, candidate_pool, top_k=15
            )
            
            # Enhance with learning insights
            enhanced_similar = []
            for inf, similarity in similar_influencers:
                enhanced_inf = inf.copy()
                enhanced_inf['similarity_score'] = similarity
                enhanced_inf['recommended_reason'] = f"Semantic similarity: {similarity:.2f}"
                
                # Add learning-based insights if available
                if insights.get("success_patterns"):
                    patterns = insights["success_patterns"]
                    if inf.get('engagement_rate', 0) > patterns.get('high_engagement_threshold', 0.05):
                        enhanced_inf['learning_flag'] = "High engagement (historically successful)"
                
                enhanced_similar.append(enhanced_inf)
            
            return enhanced_similar
            
        except Exception as e:
            logger.error(f"Error finding similar successful influencers: {str(e)}")
            return []
    
    def _create_ultra_optimized_prompt(self, campaign_data, brand_data, influencers):
        """Ultra-compressed prompt format"""
        # Use abbreviations and compact format
        c = campaign_data
        b = brand_data
        
        # Compress influencer data to minimum
        inf_str = "|".join([
            f"{inf.get('_id')}:{inf.get('username')}:{inf.get('followers')}:"
            f"{inf.get('engagement_rate', 0):.1%}:{inf.get('niche', 'Gen')}"
            for inf in influencers[:15]  # Increase to 15 with compression
        ])
        
        return f"""C:{c.get('title')}|B:{b.get('companyName')}|T:{c.get('targetAudience')}
N:{c.get('niche')}|$:{c.get('budgetRange')}|L:{c.get('geographicFocus')}
INF:{inf_str}"""
    
    def _calculate_fit_score_locally(self, influencer, campaign, brand):
        """Pre-calculate basic fit scores to guide AI"""
        score = 0
        
        # Niche alignment (0-30 points)
        if influencer.get('niche') == campaign.get('niche'):
            score += 30
        elif self._related_niches(influencer.get('niche'), campaign.get('niche')):
            score += 20
        
        # Engagement rate (0-20 points)
        eng_rate = influencer.get('engagement_rate', 0)
        if eng_rate > 0.05:  # 5%+
            score += 20
        elif eng_rate > 0.03:  # 3%+
            score += 15
        
        # Geographic match (0-15 points)
        # ... more scoring logic
        
        return min(score, 100)
    
    def check_api_status(self):
        """Simple check to verify OpenAI API connectivity"""
        try:
            # Just a simple API call to verify connection
            models = self.client.models.list()
            return True
        except Exception as e:
            raise Exception(f"OpenAI API connection failed: {str(e)}")
    
    # Keep original method for backward compatibility
    def generate_smart_recommendations(self, campaign_data: Dict[str, Any], brand_data: Dict[str, Any], influencers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Original method - now calls enhanced version"""
        return self.generate_enhanced_recommendations(campaign_data, brand_data, influencers)

# Create enhanced client instance
smart_openai_client = SmartOpenAIClient()
