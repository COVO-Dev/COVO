import openai
from openai import OpenAI
from config import settings
import json
import logging
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIClient:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        
    def generate_recommendations(self, user_data: Dict[str, Any], target_users: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate recommendations using OpenAI GPT"""
        try:
            system_prompt = self._create_system_prompt()
            user_prompt = self._create_user_prompt(user_data, target_users)
            
            response = self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=settings.max_tokens,
                temperature=settings.temperature
            )
            
            return {
                "recommendations": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                } if response.usage else None
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
    
    def _create_system_prompt(self) -> str:
        return """You are an AI recommendation system for the COVO platform that connects brands with influencers.
        
        Your task is to analyze campaign data and recommend the most suitable influencers for brand campaigns.
        
        Consider these factors when making recommendations:
        - Campaign objectives and primary goals alignment
        - Influencer niche relevance to campaign targets
        - Audience demographics match with campaign target audience
        - Geographic relevance and reach
        - Follower count and engagement quality
        - Previous collaboration styles and content quality
        - Budget alignment and collaboration preferences
        - Brand-influencer value alignment
        
        Analyze the campaign requirements and influencer profiles provided.
        Rank influencers by suitability and provide detailed reasoning.
        
        IMPORTANT: Respond ONLY in valid JSON format with this exact structure:
        {
            "recommendations": [
                {
                    "username": "influencer_username",
                    "confidence_score": 0.85,
                    "reasoning": "Detailed explanation of why this influencer is a good fit",
                    "potential_collaboration": "Suggested collaboration type and approach"
                }
            ],
            "summary": "Overall recommendation summary for this campaign",
            "strategy_notes": "Strategic insights for the brand"
        }
        
        Limit to maximum 5 recommendations, ordered by suitability."""
    
    def _create_user_prompt(self, user_data: Dict[str, Any], target_users: List[Dict[str, Any]]) -> str:
        """Create campaign-specific prompt for influencer recommendations"""
        
        # Extract campaign information with comprehensive data
        campaign = user_data.get('campaign', {})
        brand_info = {
            'company': user_data.get('companyName', 'Unknown'),
            'industry': user_data.get('industry', 'Not specified'),
            'bio': user_data.get('bio', 'No bio available')
        }
        
        # Create unique campaign identifier for context
        campaign_id = campaign.get('_id', 'unknown')
        
        # Format campaign details with comprehensive analysis requirements
        campaign_details = f"""
🎯 CAMPAIGN ANALYSIS REQUEST [ID: {campaign_id}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CAMPAIGN DETAILS:
- Title: "{campaign.get('title', 'Untitled Campaign')}"
- Target Audience: {campaign.get('targetAudience', 'Not specified')}
- Primary Goals: {self._format_goals(campaign.get('primaryGoals', []))}
- Required Influencer Type: {campaign.get('influencerType', 'Any')}
- Geographic Focus: {campaign.get('geographicFocus', 'Global')}
- Budget Range: ${campaign.get('budgetRange', 0):,}
- Collaboration Type: {campaign.get('collaborationType', 'Not specified')}
- Content Styles: {self._format_styles(campaign.get('styles', []))}
- Campaign Duration: {campaign.get('duration', 'Not specified')}
- Special Requirements: {campaign.get('specialRequirements', 'None')}

🏢 BRAND PROFILE:
- Company: {brand_info['company']}
- Industry: {brand_info['industry']}
- Brand Values: {brand_info['bio']}
- Brand Personality: {self._analyze_brand_personality(brand_info)}

🎯 MATCHING CRITERIA:
- Audience Overlap: Must match target demographics
- Content Alignment: Style must fit brand aesthetic
- Geographic Relevance: Location-based targeting requirements
- Engagement Quality: Authentic interaction rates
- Brand Safety: Content appropriateness and values alignment
"""
        
        # Format influencer data with comprehensive analysis
        influencer_profiles = []
        for idx, inf in enumerate(target_users, 1):
            # Calculate dynamic scores based on campaign fit
            campaign_fit_score = self._calculate_campaign_fit(inf, campaign)
            audience_match_score = self._calculate_audience_match(inf, campaign)
            engagement_quality = self._analyze_engagement_quality(inf)
            follower_tier = self._get_follower_tier(inf.get('followers', 0))
            geographic_relevance = self._check_geographic_relevance(inf, campaign)
            
            # Build comprehensive influencer profile
            profile = f"""
👤 INFLUENCER #{idx}: @{inf.get('username', 'unknown')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 BASIC METRICS:
- Full Name: {inf.get('firstName', '')} {inf.get('lastName', '')}
- Followers: {inf.get('followers', 0):,} ({follower_tier} tier)
- Engagement Rate: {inf.get('engagement_rate', 0):.2%} ({engagement_quality})
- COVO Score: {inf.get('covoScore', 0)}/100
- Account Verified: {inf.get('verified', 'Unknown')}

🎯 CAMPAIGN ALIGNMENT:
- Campaign Fit Score: {campaign_fit_score}/10
- Audience Match: {audience_match_score}/10
- Geographic Relevance: {geographic_relevance}
- Content Style Fit: {self._assess_content_style_fit(inf, campaign)}

📍 DEMOGRAPHICS:
- Location: {inf.get('location', 'Not specified')}
- Age Range: {inf.get('ageRange', 'Not specified')}
- Primary Language: {inf.get('primaryLanguage', 'Not specified')}
- Time Zone: {inf.get('timeZone', 'Not specified')}

📝 CONTENT PROFILE:
- Bio: {inf.get('bio', 'No bio available')[:200]}
- Content Categories: {self._extract_content_categories(inf)}
- Posting Frequency: {inf.get('postingFrequency', 'Unknown')}
- Best Performance Time: {inf.get('bestPostTime', 'Unknown')}

💼 COLLABORATION HISTORY:
- Previous Campaigns: {inf.get('campaignHistory', 0)} completed
- Brand Partnerships: {inf.get('brandPartnerships', 'None listed')}
- Average Campaign Performance: {inf.get('avgCampaignPerformance', 'No data')}
- Collaboration Rating: {inf.get('collaborationRating', 'Not rated')}/5

💰 COMMERCIAL METRICS:
- Estimated Rate: ${inf.get('estimatedRate', 0):,} per post
- ROI History: {inf.get('roiHistory', 'No data')}
- Conversion Rate: {inf.get('conversionRate', 'Unknown')}
"""
            influencer_profiles.append(profile)
        
        influencer_section = "\n".join(influencer_profiles)
        
        return f"""{campaign_details}

INFLUENCER CANDIDATES FOR ANALYSIS:
{influencer_section}

ANALYSIS REQUIREMENTS:
1. Match each influencer's audience demographics with the campaign's target audience
2. Evaluate content style alignment with campaign goals
3. Assess geographic relevance for the campaign
4. Consider budget alignment based on follower count and engagement
5. Analyze potential for authentic brand partnership
6. Evaluate long-term collaboration potential

Please provide detailed analysis and rank the top 5 most suitable influencers. Focus on DATA-DRIVEN reasoning based on the specific campaign requirements and influencer metrics provided."""

    def _format_goals(self, goals: list) -> str:
        """Format campaign goals for display"""
        if not goals:
            return "Not specified"
        return ", ".join(goals)

    def _format_styles(self, styles: list) -> str:
        """Format content styles for display"""
        if not styles:
            return "Not specified"
        return ", ".join(styles)

    def _analyze_brand_personality(self, brand_info: dict) -> str:
        """Analyze brand personality from brand info"""
        bio = brand_info.get('bio', '').lower()
        industry = brand_info.get('industry', '').lower()
        
        personality_traits = []
        
        # Industry-based personality hints
        if 'fashion' in industry:
            personality_traits.append('stylish')
        if 'tech' in industry:
            personality_traits.append('innovative')
        if 'food' in industry:
            personality_traits.append('appetizing')
        if 'travel' in industry:
            personality_traits.append('adventurous')
        
        # Bio-based personality analysis
        if any(word in bio for word in ['luxury', 'premium', 'exclusive']):
            personality_traits.append('premium')
        if any(word in bio for word in ['fun', 'playful', 'vibrant']):
            personality_traits.append('playful')
        if any(word in bio for word in ['sustainable', 'eco', 'green']):
            personality_traits.append('sustainable')
        if any(word in bio for word in ['professional', 'corporate', 'business']):
            personality_traits.append('professional')
        
        return ', '.join(personality_traits) if personality_traits else 'General brand'

    def _get_follower_tier(self, followers: int) -> str:
        """Categorize influencer by follower count"""
        if followers < 1000:
            return "Nano-Influencer"
        elif followers < 10000:
            return "Micro-Influencer"
        elif followers < 100000:
            return "Mid-tier"
        elif followers < 1000000:
            return "Macro-Influencer"
        else:
            return "Mega-Influencer"

    def _calculate_campaign_fit(self, influencer, campaign):
        """Calculate how well an influencer fits the specific campaign"""
        score = 5  # Base score
        
        # Industry/niche alignment
        influencer_bio = influencer.get('bio', '').lower()
        campaign_description = campaign.get('description', '').lower()
        campaign_title = campaign.get('title', '').lower()
        
        # Check for keyword overlap
        campaign_keywords = set(campaign_description.split() + campaign_title.split())
        bio_keywords = set(influencer_bio.split())
        keyword_overlap = len(campaign_keywords.intersection(bio_keywords))
        score += min(keyword_overlap * 0.5, 3)  # Max 3 points for keyword overlap
        
        # Follower count fit for campaign scale
        followers = influencer.get('followers', 0)
        campaign_budget = campaign.get('budget', 0)
        if campaign_budget > 10000 and followers > 100000:
            score += 1
        elif campaign_budget < 5000 and 10000 <= followers <= 100000:
            score += 1
        
        # Engagement quality boost
        engagement_rate = influencer.get('engagement_rate', 0)
        if engagement_rate > 0.05:
            score += 1
        
        return min(score, 10)

    def _calculate_audience_match(self, influencer, campaign):
        """Calculate audience demographic match"""
        score = 5  # Base score
        
        # Geographic match
        influencer_location = influencer.get('location', '').lower()
        campaign_target_location = campaign.get('targetLocation', '').lower()
        if campaign_target_location and influencer_location:
            if campaign_target_location in influencer_location:
                score += 2
        
        # Age range considerations
        influencer_age = influencer.get('ageRange', '')
        campaign_target_age = campaign.get('targetAgeRange', '')
        if campaign_target_age and influencer_age:
            if any(age in influencer_age for age in campaign_target_age.split('-')):
                score += 1
        
        # Language match
        influencer_lang = influencer.get('primaryLanguage', '').lower()
        campaign_lang = campaign.get('targetLanguage', 'english').lower()
        if influencer_lang == campaign_lang:
            score += 1
        
        # COVO score boost for high-quality matches
        covo_score = influencer.get('covoScore', 0)
        if covo_score > 80:
            score += 1
        
        return min(score, 10)

    def _analyze_engagement_quality(self, influencer):
        """Analyze the quality of influencer engagement"""
        engagement_rate = influencer.get('engagement_rate', 0)
        
        if engagement_rate > 0.08:
            return "Exceptional"
        elif engagement_rate > 0.05:
            return "High"
        elif engagement_rate > 0.03:
            return "Good"
        elif engagement_rate > 0.01:
            return "Average"
        else:
            return "Low"

    def _check_geographic_relevance(self, influencer, campaign):
        """Check if influencer's location is relevant to campaign"""
        influencer_location = influencer.get('location', '').lower()
        campaign_target = campaign.get('targetLocation', '').lower()
        
        if not campaign_target:
            return "Global Campaign"
        
        if campaign_target in influencer_location:
            return "Perfect Match"
        elif any(keyword in influencer_location for keyword in campaign_target.split()):
            return "Good Match"
        else:
            return "Geographic Mismatch"

    def _assess_content_style_fit(self, influencer, campaign):
        """Assess how well influencer's content style fits campaign"""
        bio = influencer.get('bio', '').lower()
        campaign_style = campaign.get('contentStyle', '').lower()
        campaign_desc = campaign.get('description', '').lower()
        
        style_indicators = {
            'lifestyle': ['lifestyle', 'life', 'daily', 'routine'],
            'fashion': ['fashion', 'style', 'outfit', 'clothing'],
            'fitness': ['fitness', 'workout', 'gym', 'health'],
            'food': ['food', 'recipe', 'cooking', 'chef'],
            'travel': ['travel', 'adventure', 'explore', 'journey'],
            'beauty': ['beauty', 'makeup', 'skincare', 'cosmetics'],
            'tech': ['tech', 'technology', 'gadget', 'digital']
        }
        
        bio_style_matches = []
        for style, keywords in style_indicators.items():
            if any(keyword in bio for keyword in keywords):
                bio_style_matches.append(style)
        
        campaign_style_matches = []
        for style, keywords in style_indicators.items():
            if any(keyword in campaign_desc for keyword in keywords):
                campaign_style_matches.append(style)
        
        overlap = set(bio_style_matches).intersection(set(campaign_style_matches))
        if overlap:
            return f"Excellent ({', '.join(overlap)})"
        elif bio_style_matches:
            return f"Moderate ({', '.join(bio_style_matches[:2])})"
        else:
            return "General Content"

    def _extract_content_categories(self, influencer):
        """Extract content categories from influencer data"""
        bio = influencer.get('bio', '').lower()
        categories = []
        
        category_keywords = {
            'Lifestyle': ['lifestyle', 'life', 'daily'],
            'Fashion': ['fashion', 'style', 'outfit'],
            'Fitness': ['fitness', 'workout', 'gym'],
            'Food': ['food', 'recipe', 'cooking'],
            'Travel': ['travel', 'adventure', 'explore'],
            'Beauty': ['beauty', 'makeup', 'skincare'],
            'Tech': ['tech', 'technology', 'gadget'],
            'Business': ['entrepreneur', 'business', 'startup'],
            'Art': ['art', 'creative', 'design'],
            'Music': ['music', 'musician', 'artist']
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in bio for keyword in keywords):
                categories.append(category)
        
        return ', '.join(categories) if categories else 'General Content'

# Create global instance
openai_client = OpenAIClient()