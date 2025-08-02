"""
Enhanced COVO Recommendation System Usage Examples
Demonstrates learning system and semantic search capabilities
"""

from smart_openai_client import smart_openai_client
from recommendation_learning_system import learning_system, CampaignOutcome
from semantic_search_engine import semantic_search

# Example 1: Generate Enhanced Recommendations
def example_enhanced_recommendations():
    """Example of using the enhanced recommendation system"""
    
    campaign_data = {
        "_id": "campaign_123",
        "title": "Summer Fashion Collection 2025",
        "description": "Promoting trendy summer wear for young adults",
        "niche": "Fashion", 
        "targetAudience": "Women aged 18-35",
        "budgetRange": 50000,
        "geographicFocus": "United States",
        "primaryGoals": ["Brand Awareness", "Sales"]
    }
    
    brand_data = {
        "_id": "brand_456",
        "companyName": "TrendyWear Co",
        "industry": "Fashion & Apparel",
        "bio": "Sustainable fashion brand focusing on modern, eco-friendly clothing for young professionals"
    }
    
    influencers = [
        {
            "_id": "inf_001",
            "username": "fashionista_jane",
            "followers": 150000,
            "engagement_rate": 0.045,
            "bio": "Fashion blogger sharing sustainable style tips",
            "location": {"country": "United States", "city": "Los Angeles"},
            "covoScore": 85,
            "contentAndAudience": {
                "primaryNiche": "Fashion",
                "interests": ["Sustainable Fashion", "Style Tips", "Trends"]
            }
        },
        # Add more influencers...
    ]
    
    # Generate enhanced recommendations
    recommendations = smart_openai_client.generate_enhanced_recommendations(
        campaign_data, brand_data, influencers
    )
    
    print("Enhanced Recommendations:", recommendations)
    return recommendations

# Example 2: Record Campaign Outcome for Learning
def example_record_campaign_outcome():
    """Example of recording campaign outcomes for learning"""
    
    # Record successful campaign outcome
    smart_openai_client.record_campaign_outcome(
        campaign_id="campaign_123",
        influencer_id="inf_001", 
        fit_score=88.5,
        actual_performance=92.0,  # High performance
        engagement_rate=0.065,
        conversion_rate=0.08,
        roi=3.2,
        success_metrics={
            "brand_awareness_lift": 0.25,
            "click_through_rate": 0.045,
            "cost_per_acquisition": 15.50
        }
    )
    
    print("Campaign outcome recorded for learning")

# Example 3: Semantic Search for Influencers
def example_semantic_search():
    """Example of semantic search functionality"""
    
    # Search query
    query = "sustainable fashion influencer with millennial audience interested in eco-friendly lifestyle"
    
    # Example influencer pool
    influencer_pool = [
        {
            "_id": "inf_002",
            "username": "eco_style_guru",
            "bio": "Sustainable fashion advocate, sharing eco-friendly style tips for conscious consumers",
            "contentAndAudience": {
                "primaryNiche": "Fashion",
                "interests": ["Sustainability", "Eco-friendly", "Conscious Living"]
            }
        },
        # More influencers...
    ]
    
    # Perform semantic search
    search_results = smart_openai_client.semantic_search_influencers(
        query, influencer_pool, top_k=10
    )
    
    print("Semantic Search Results:")
    for influencer, similarity_score in search_results:
        print(f"- {influencer['username']}: {similarity_score:.3f} similarity")
    
    return search_results

# Example 4: Find Similar Successful Influencers
def example_find_similar_influencers():
    """Example of finding similar successful influencers"""
    
    # Target influencer (known to be successful)
    target_influencer = {
        "_id": "inf_successful",
        "username": "top_performer",
        "bio": "Fashion and lifestyle content creator with engaged millennial audience",
        "followers": 200000,
        "engagement_rate": 0.058
    }
    
    # Candidate pool
    candidate_pool = [
        # List of potential influencers...
    ]
    
    similar_influencers = smart_openai_client.find_similar_successful_influencers(
        target_influencer, candidate_pool
    )
    
    print("Similar Successful Influencers:")
    for inf in similar_influencers:
        print(f"- {inf['username']}: Similarity {inf['similarity_score']:.3f}")
        if inf.get('learning_flag'):
            print(f"  Learning insight: {inf['learning_flag']}")
    
    return similar_influencers

# Example 5: Get Performance Metrics
def example_performance_metrics():
    """Example of getting system performance metrics"""
    
    metrics = smart_openai_client.get_performance_metrics()
    
    print("System Performance Metrics:")
    print(f"- Total requests: {metrics['system_metrics']['total_requests']}")
    print(f"- Cache hit rate: {metrics['performance_ratios']['cache_hit_rate']:.2%}")
    print(f"- Avg tokens per request: {metrics['performance_ratios']['avg_tokens_per_request']:.1f}")
    print(f"- Semantic enhancement rate: {metrics['performance_ratios']['enhancement_usage_rate']['semantic']:.2%}")
    print(f"- Learning enhancement rate: {metrics['performance_ratios']['enhancement_usage_rate']['learning']:.2%}")
    
    return metrics

# Example 6: Get Learning Insights
def example_learning_insights():
    """Example of getting learning system insights"""
    
    insights = learning_system.get_learning_insights()
    
    print("Learning System Insights:")
    if insights.get('status') == 'insufficient_data':
        print("- Insufficient data for learning (need more campaign outcomes)")
    else:
        print(f"- Successful campaigns analyzed: {insights['total_successful_campaigns']}")
        print(f"- Average performance: {insights['average_performance']:.1f}")
        print("- Key recommendations:")
        for rec in insights.get('recommendations', []):
            print(f"  • {rec}")
    
    return insights

if __name__ == "__main__":
    # Run examples
    print("=== Enhanced COVO Recommendation System Examples ===\n")
    
    print("1. Enhanced Recommendations:")
    example_enhanced_recommendations()
    print()
    
    print("2. Recording Campaign Outcome:")
    example_record_campaign_outcome() 
    print()
    
    print("3. Semantic Search:")
    example_semantic_search()
    print()
    
    print("4. Similar Influencers:")
    example_find_similar_influencers()
    print()
    
    print("5. Performance Metrics:")
    example_performance_metrics()
    print()
    
    print("6. Learning Insights:")
    example_learning_insights()
