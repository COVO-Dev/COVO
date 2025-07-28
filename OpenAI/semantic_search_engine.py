"""
Semantic Search Engine for Enhanced Influencer Recommendations
Uses advanced NLP techniques to find better matches
"""

import logging
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    print("Warning: NumPy not available, using fallback methods")

from typing import Dict, Any, List, Optional, Tuple
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import re
from redis_service import redis_service
from database_service import database_service

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

class SemanticSearchEngine:
    def __init__(self):
        self.model = None
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2
        )
        self.cache_ttl = 3600  # 1 hour cache
        self._load_model()
    
    def _load_model(self):
        """Load the sentence transformer model for semantic search"""
        try:
            # Use a lightweight but effective model
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Semantic search model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load semantic model: {str(e)}. Falling back to TF-IDF")
            self.model = None
    
    def create_influencer_profile_text(self, influencer: Dict[str, Any]) -> str:
        """Create a comprehensive text profile for semantic analysis"""
        profile_parts = []
        
        # Basic info
        if influencer.get('bio'):
            profile_parts.append(influencer['bio'])
        
        # Niche and interests
        content_data = influencer.get('contentAndAudience', {})
        if content_data.get('primaryNiche'):
            profile_parts.append(f"Primary niche: {content_data['primaryNiche']}")
        
        if content_data.get('interests'):
            interests = content_data['interests']
            if isinstance(interests, list):
                profile_parts.append(f"Interests: {', '.join(interests)}")
            elif isinstance(interests, str):
                profile_parts.append(f"Interests: {interests}")
        
        # Audience demographics
        if content_data.get('audienceDemographics'):
            demo = content_data['audienceDemographics']
            if demo.get('ageRanges'):
                profile_parts.append(f"Audience age ranges: {demo['ageRanges']}")
            if demo.get('genderSplit'):
                profile_parts.append(f"Gender split: {demo['genderSplit']}")
            if demo.get('topLocations'):
                profile_parts.append(f"Top locations: {', '.join(demo['topLocations'])}")
        
        # Location
        location = influencer.get('location', {})
        if isinstance(location, dict):
            if location.get('country'):
                profile_parts.append(f"Location: {location['country']}")
            if location.get('city'):
                profile_parts.append(f"City: {location['city']}")
        elif isinstance(location, str):
            profile_parts.append(f"Location: {location}")
        
        # Recent posts analysis (if available)
        if influencer.get('recentPosts'):
            posts_text = self._extract_posts_keywords(influencer['recentPosts'])
            if posts_text:
                profile_parts.append(f"Recent content themes: {posts_text}")
        
        return " | ".join(profile_parts)
    
    def create_campaign_profile_text(self, campaign_data: Dict[str, Any], brand_data: Dict[str, Any]) -> str:
        """Create campaign and brand profile text for matching"""
        profile_parts = []
        
        # Campaign info
        if campaign_data.get('title'):
            profile_parts.append(f"Campaign: {campaign_data['title']}")
        
        if campaign_data.get('description'):
            profile_parts.append(campaign_data['description'])
        
        if campaign_data.get('niche'):
            profile_parts.append(f"Target niche: {campaign_data['niche']}")
        
        if campaign_data.get('targetAudience'):
            profile_parts.append(f"Target audience: {campaign_data['targetAudience']}")
        
        if campaign_data.get('primaryGoals'):
            goals = campaign_data['primaryGoals']
            if isinstance(goals, list):
                profile_parts.append(f"Goals: {', '.join(goals)}")
            else:
                profile_parts.append(f"Goals: {goals}")
        
        # Brand info
        if brand_data.get('companyName'):
            profile_parts.append(f"Brand: {brand_data['companyName']}")
        
        if brand_data.get('industry'):
            profile_parts.append(f"Industry: {brand_data['industry']}")
        
        if brand_data.get('bio'):
            profile_parts.append(f"Brand description: {brand_data['bio']}")
        
        if brand_data.get('brandValues'):
            profile_parts.append(f"Values: {brand_data['brandValues']}")
        
        return " | ".join(profile_parts)
    
    def _extract_posts_keywords(self, posts: List[Dict]) -> str:
        """Extract keywords from recent posts"""
        if not posts:
            return ""
        
        post_texts = []
        for post in posts[:5]:  # Limit to 5 recent posts
            if post.get('caption'):
                # Clean hashtags and mentions
                caption = re.sub(r'#\w+', '', post['caption'])
                caption = re.sub(r'@\w+', '', caption)
                caption = caption.strip()
                if caption:
                    post_texts.append(caption)
        
        if not post_texts:
            return ""
        
        # Use TF-IDF to extract important terms
        try:
            tfidf = TfidfVectorizer(max_features=10, stop_words='english')
            tfidf_matrix = tfidf.fit_transform(post_texts)
            feature_names = tfidf.get_feature_names_out()
            return ", ".join(feature_names[:5])  # Top 5 keywords
        except:
            return " ".join(post_texts)[:100]  # Fallback
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        try:
            if self.model and NUMPY_AVAILABLE:
                # Use sentence transformer for semantic similarity
                embeddings = self.model.encode([text1, text2])
                if hasattr(embeddings, 'shape') and len(embeddings) == 2:
                    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
                    return float(similarity)
                else:
                    logger.warning("Invalid embeddings shape, using fallback")
                    return self._calculate_tfidf_similarity(text1, text2)
            else:
                # Fallback to TF-IDF similarity
                return self._calculate_tfidf_similarity(text1, text2)
        except Exception as e:
            logger.warning(f"Semantic similarity calculation failed: {str(e)}")
            return self._calculate_tfidf_similarity(text1, text2)
    
    def _calculate_tfidf_similarity(self, text1: str, text2: str) -> float:
        """Fallback TF-IDF based similarity"""
        try:
            tfidf_matrix = self.tfidf_vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except:
            return 0.0
    
    def enhance_influencer_matching(self, campaign_data: Dict[str, Any], 
                                  brand_data: Dict[str, Any], 
                                  influencers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhance influencer matching using semantic search"""
        try:
            # Create campaign profile
            campaign_profile = self.create_campaign_profile_text(campaign_data, brand_data)
            
            enhanced_influencers = []
            
            for influencer in influencers:
                enhanced_inf = influencer.copy()
                
                # Create influencer profile
                inf_profile = self.create_influencer_profile_text(influencer)
                
                # Calculate semantic similarity
                semantic_score = self.calculate_semantic_similarity(campaign_profile, inf_profile)
                
                # Add semantic score to influencer data
                enhanced_inf['semantic_similarity'] = semantic_score
                enhanced_inf['semantic_boosted'] = semantic_score > 0.3  # Threshold for good match
                
                # Calculate enhanced fit score combining original COVO score with semantic score
                original_score = influencer.get('covoScore', 0)
                
                # Weighted combination: 70% original score, 30% semantic score
                enhanced_score = (original_score * 0.7) + (semantic_score * 100 * 0.3)
                enhanced_inf['enhanced_covo_score'] = min(100, enhanced_score)
                
                enhanced_influencers.append(enhanced_inf)
            
            # Sort by enhanced score
            enhanced_influencers.sort(key=lambda x: x.get('enhanced_covo_score', 0), reverse=True)
            
            return enhanced_influencers
            
        except Exception as e:
            logger.error(f"Error in semantic matching enhancement: {str(e)}")
            return influencers
    
    def find_similar_influencers(self, target_influencer: Dict[str, Any], 
                                candidate_pool: List[Dict[str, Any]], 
                                top_k: int = 10) -> List[Tuple[Dict[str, Any], float]]:
        """Find influencers similar to a target influencer"""
        try:
            target_profile = self.create_influencer_profile_text(target_influencer)
            
            similarities = []
            for candidate in candidate_pool:
                candidate_profile = self.create_influencer_profile_text(candidate)
                similarity = self.calculate_semantic_similarity(target_profile, candidate_profile)
                similarities.append((candidate, similarity))
            
            # Sort by similarity and return top k
            similarities.sort(key=lambda x: x[1], reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            logger.error(f"Error finding similar influencers: {str(e)}")
            return []
    
    def semantic_search_influencers(self, query: str, influencers: List[Dict[str, Any]], 
                                  top_k: int = 20) -> List[Tuple[Dict[str, Any], float]]:
        """Search influencers using semantic similarity to a text query"""
        try:
            results = []
            
            for influencer in influencers:
                inf_profile = self.create_influencer_profile_text(influencer)
                similarity = self.calculate_semantic_similarity(query, inf_profile)
                results.append((influencer, similarity))
            
            # Sort by similarity
            results.sort(key=lambda x: x[1], reverse=True)
            return results[:top_k]
            
        except Exception as e:
            logger.error(f"Error in semantic search: {str(e)}")
            return []

# Create semantic search engine instance
semantic_search = SemanticSearchEngine()
