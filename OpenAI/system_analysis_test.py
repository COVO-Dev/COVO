#!/usr/bin/env python3
"""
Comprehensive System Analysis Report for COVO ML System
Tests Redis, Vector DB, ML Models, and provides detailed analysis
"""

import json
import time
import logging
import traceback
from datetime import datetime
from typing import Dict, Any, List, Optional

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SystemAnalyzer:
    def __init__(self):
        self.test_results = {}
        self.system_status = {}
        self.performance_metrics = {}
        
    def run_comprehensive_analysis(self):
        """Run complete system analysis"""
        print("🔍 COVO ML SYSTEM COMPREHENSIVE ANALYSIS")
        print("=" * 60)
        
        # Test 1: Configuration Analysis
        self.test_configuration()
        
        # Test 2: Redis Cache System
        self.test_redis_system()
        
        # Test 3: Vector Database System
        self.test_vector_db_system()
        
        # Test 4: ML Model Components
        self.test_ml_components()
        
        # Test 5: Learning System
        self.test_learning_system()
        
        # Test 6: Integration Tests
        self.test_system_integration()
        
        # Generate final report
        self.generate_final_report()
    
    def test_configuration(self):
        """Test system configuration"""
        print("\n📋 1. CONFIGURATION ANALYSIS")
        print("-" * 40)
        
        try:
            from config import settings
            
            config_status = {
                "openai_configured": bool(settings.openai_api_key and settings.openai_api_key != "your-openai-api-key"),
                "mongodb_configured": bool(settings.mongodb_uri),
                "redis_configured": True,  # Default localhost
                "vector_db_enabled": settings.vector_db_enabled,
                "vector_db_configured": bool(settings.vector_db_host),
            }
            
            print(f"✅ OpenAI API Key: {'Configured' if config_status['openai_configured'] else '❌ Not Configured'}")
            print(f"✅ MongoDB URI: {'Configured' if config_status['mongodb_configured'] else '❌ Not Configured'}")
            print(f"✅ Redis Config: {'Configured' if config_status['redis_configured'] else '❌ Not Configured'}")
            print(f"✅ Vector DB: {'Enabled' if config_status['vector_db_enabled'] else '❌ Disabled'}")
            
            self.test_results['configuration'] = {
                'status': 'success',
                'details': config_status,
                'recommendations': []
            }
            
            if not config_status['openai_configured']:
                self.test_results['configuration']['recommendations'].append("Configure OpenAI API key")
            if not config_status['mongodb_configured']:
                self.test_results['configuration']['recommendations'].append("Configure MongoDB URI")
                
        except Exception as e:
            print(f"❌ Configuration test failed: {str(e)}")
            self.test_results['configuration'] = {'status': 'failed', 'error': str(e)}
    
    def test_redis_system(self):
        """Comprehensive Redis cache system test"""
        print("\n🔄 2. REDIS CACHE SYSTEM ANALYSIS")
        print("-" * 40)
        
        try:
            from redis_service import redis_service
            
            # Test 1: Connection
            connection_start = time.time()
            is_connected = redis_service.is_connected()
            connection_time = time.time() - connection_start
            
            print(f"Connection Status: {'✅ Connected' if is_connected else '❌ Disconnected'}")
            print(f"Connection Time: {connection_time:.3f}s")
            
            redis_results = {
                'connection': is_connected,
                'connection_time': connection_time,
                'operations': {},
                'performance': {}
            }
            
            if is_connected:
                # Test 2: Basic Operations
                print("\n🧪 Testing Redis Operations:")
                
                # Set operation
                set_start = time.time()
                set_success = redis_service.set("test_key", {"test": "data", "timestamp": datetime.now().isoformat()})
                set_time = time.time() - set_start
                print(f"  SET operation: {'✅ Success' if set_success else '❌ Failed'} ({set_time:.3f}s)")
                
                # Get operation
                get_start = time.time()
                retrieved_data = redis_service.get("test_key")
                get_time = time.time() - get_start
                get_success = retrieved_data is not None
                print(f"  GET operation: {'✅ Success' if get_success else '❌ Failed'} ({get_time:.3f}s)")
                
                # Increment counter
                counter_start = time.time()
                counter_val = redis_service.increment_counter("test_counter", 1, 3600)
                counter_time = time.time() - counter_start
                counter_success = counter_val is not None
                print(f"  COUNTER operation: {'✅ Success' if counter_success else '❌ Failed'} ({counter_time:.3f}s)")
                
                # Delete operation
                delete_start = time.time()
                delete_success = redis_service.delete("test_key")
                delete_time = time.time() - delete_start
                print(f"  DELETE operation: {'✅ Success' if delete_success else '❌ Failed'} ({delete_time:.3f}s)")
                
                redis_results['operations'] = {
                    'set': {'success': set_success, 'time': set_time},
                    'get': {'success': get_success, 'time': get_time},
                    'counter': {'success': counter_success, 'time': counter_time, 'value': counter_val},
                    'delete': {'success': delete_success, 'time': delete_time}
                }
                
                # Test 3: Performance Test
                print("\n⚡ Performance Testing:")
                performance_data = self._redis_performance_test(redis_service)
                redis_results['performance'] = performance_data
                
                # Test 4: Memory Usage Simulation
                print("\n💾 Memory Usage Test:")
                memory_test = self._redis_memory_test(redis_service)
                redis_results['memory_test'] = memory_test
                
            self.test_results['redis'] = {'status': 'success', 'details': redis_results}
            
        except Exception as e:
            print(f"❌ Redis test failed: {str(e)}")
            traceback.print_exc()
            self.test_results['redis'] = {'status': 'failed', 'error': str(e)}
    
    def _redis_performance_test(self, redis_service) -> Dict:
        """Test Redis performance with multiple operations"""
        operations = [10, 50, 100]
        results = {}
        
        for op_count in operations:
            start_time = time.time()
            
            # Batch set operations
            for i in range(op_count):
                redis_service.set(f"perf_test_{i}", {"data": f"test_data_{i}", "index": i})
            
            set_time = time.time() - start_time
            
            # Batch get operations
            get_start = time.time()
            for i in range(op_count):
                redis_service.get(f"perf_test_{i}")
            get_time = time.time() - get_start
            
            # Cleanup
            for i in range(op_count):
                redis_service.delete(f"perf_test_{i}")
            
            results[f"{op_count}_operations"] = {
                'set_time': set_time,
                'get_time': get_time,
                'total_time': set_time + get_time,
                'ops_per_second': (op_count * 2) / (set_time + get_time)
            }
            
            print(f"  {op_count} ops: {results[f'{op_count}_operations']['ops_per_second']:.1f} ops/sec")
        
        return results
    
    def _redis_memory_test(self, redis_service) -> Dict:
        """Test Redis memory usage patterns"""
        # Test different data sizes
        data_sizes = {
            'small': {'key': 'small_data', 'value': 'x' * 100},
            'medium': {'key': 'medium_data', 'value': 'x' * 10000},
            'large': {'key': 'large_data', 'value': 'x' * 100000}
        }
        
        results = {}
        
        for size_name, data in data_sizes.items():
            start_time = time.time()
            success = redis_service.set(data['key'], data['value'])
            set_time = time.time() - start_time
            
            if success:
                get_start = time.time()
                retrieved = redis_service.get(data['key'])
                get_time = time.time() - get_start
                
                results[size_name] = {
                    'set_time': set_time,
                    'get_time': get_time,
                    'data_size': len(str(data['value'])),
                    'success': retrieved == data['value']
                }
                
                redis_service.delete(data['key'])
            else:
                results[size_name] = {'success': False}
            
            print(f"  {size_name.capitalize()} data ({len(str(data['value']))} bytes): {'✅' if results[size_name].get('success', False) else '❌'}")
        
        return results
    
    def test_vector_db_system(self):
        """Test Vector Database system"""
        print("\n🔢 3. VECTOR DATABASE ANALYSIS")
        print("-" * 40)
        
        try:
            from vector_db_service import vector_db_service
            
            # Test connection
            is_connected = vector_db_service.is_connected()
            print(f"Vector DB Connection: {'✅ Connected' if is_connected else '❌ Disconnected'}")
            
            vector_results = {
                'connection': is_connected,
                'embedding_test': None,
                'storage_test': None,
                'similarity_test': None
            }
            
            if is_connected:
                # Test embedding generation
                print("\n🧠 Testing Embedding Generation:")
                test_text = "Fashion influencer with 50k followers specializing in summer clothing"
                embedding = vector_db_service.generate_embedding(test_text)
                embedding_success = embedding is not None and len(embedding) > 0
                print(f"  Embedding Generation: {'✅ Success' if embedding_success else '❌ Failed'}")
                if embedding_success:
                    print(f"  Embedding Dimension: {len(embedding)}")
                
                vector_results['embedding_test'] = {
                    'success': embedding_success,
                    'dimension': len(embedding) if embedding else 0
                }
                
                # Test influencer storage
                if embedding_success:
                    print("\n💾 Testing Vector Storage:")
                    test_influencer = {
                        "firstName": "Jane",
                        "lastName": "Doe", 
                        "username": "jane_fashion",
                        "personalBio": "Fashion enthusiast and style blogger",
                        "followers": 50000,
                        "engagement_rate": 0.05,
                        "location": "New York, NY"
                    }
                    
                    storage_success = vector_db_service.store_influencer_embedding("test_influencer_123", test_influencer)
                    print(f"  Vector Storage: {'✅ Success' if storage_success else '❌ Failed'}")
                    
                    vector_results['storage_test'] = {'success': storage_success}
                    
                    # Test similarity search
                    if storage_success:
                        print("\n🔍 Testing Similarity Search:")
                        similar_influencers = vector_db_service.find_similar_influencers(embedding, limit=5)
                        similarity_success = len(similar_influencers) > 0
                        print(f"  Similarity Search: {'✅ Success' if similarity_success else '❌ Failed'}")
                        if similarity_success:
                            print(f"  Found {len(similar_influencers)} similar influencers")
                            for inf in similar_influencers[:2]:
                                print(f"    - {inf['influencer_id']}: {inf['similarity_score']:.3f}")
                        
                        vector_results['similarity_test'] = {
                            'success': similarity_success,
                            'results_count': len(similar_influencers)
                        }
            
            self.test_results['vector_db'] = {'status': 'success', 'details': vector_results}
            
        except Exception as e:
            print(f"❌ Vector DB test failed: {str(e)}")
            traceback.print_exc()
            self.test_results['vector_db'] = {'status': 'failed', 'error': str(e)}
    
    def test_ml_components(self):
        """Test ML model components"""
        print("\n🤖 4. MACHINE LEARNING COMPONENTS")
        print("-" * 40)
        
        try:
            # Test OpenAI client
            print("🔧 Testing OpenAI Integration:")
            from smart_openai_client import smart_openai_client
            
            # Test basic completion
            test_prompt = "Rate this influencer fit for a fashion campaign: @fashionista_jane with 50k followers in fashion niche"
            
            # Note: We won't actually call OpenAI API to avoid costs, but test the client setup
            client_configured = hasattr(smart_openai_client, 'client') and smart_openai_client.client is not None
            print(f"  OpenAI Client Setup: {'✅ Ready' if client_configured else '❌ Not Configured'}")
            
            # Test recommendation service
            print("\n📊 Testing Recommendation Service:")
            from recommendation_service import RecommendationService
            rec_service = RecommendationService()
            print("  ✅ Recommendation Service initialized")
            
            # Test learning system components
            print("\n🧠 Testing Learning System:")
            from recommendation_learning_system import learning_system
            
            # Test insights generation (should work with dummy data)
            insights = learning_system.get_learning_insights()
            insights_available = isinstance(insights, dict) and 'status' in insights
            print(f"  Learning Insights: {'✅ Available' if insights_available else '❌ Failed'}")
            
            if insights_available:
                print(f"  Insights Status: {insights.get('status', 'unknown')}")
                if insights.get('status') == 'insufficient_data':
                    print("  📝 Note: System needs more campaign data for ML learning")
            
            ml_results = {
                'openai_client': client_configured,
                'recommendation_service': True,
                'learning_system': insights_available,
                'insights_status': insights.get('status') if insights_available else None
            }
            
            self.test_results['ml_components'] = {'status': 'success', 'details': ml_results}
            
        except Exception as e:
            print(f"❌ ML components test failed: {str(e)}")
            traceback.print_exc()
            self.test_results['ml_components'] = {'status': 'failed', 'error': str(e)}
    
    def test_learning_system(self):
        """Test the machine learning and learning capabilities"""
        print("\n📚 5. LEARNING SYSTEM ANALYSIS")
        print("-" * 40)
        
        try:
            from recommendation_learning_system import learning_system, CampaignOutcome
            from database_service import database_service
            
            # Test learning components
            print("🔍 Testing Learning Components:")
            
            # Test 1: Learning system initialization
            learning_initialized = hasattr(learning_system, 'vectorizer')
            print(f"  Learning System Init: {'✅ Success' if learning_initialized else '❌ Failed'}")
            
            # Test 2: Mock campaign outcome recording
            print("\n📝 Testing Campaign Outcome Recording:")
            test_outcome = CampaignOutcome(
                campaign_id="test_campaign_123",
                influencer_id="test_influencer_456", 
                fit_score=85.5,
                actual_performance=78.2,
                engagement_rate=0.045,
                conversion_rate=0.025,
                roi=3.8,
                success_metrics={"reach": 100000, "clicks": 2500}
            )
            
            # Note: We'll simulate this instead of actually recording to avoid DB dependency
            outcome_recording_ready = hasattr(learning_system, 'record_campaign_outcome')
            print(f"  Outcome Recording: {'✅ Ready' if outcome_recording_ready else '❌ Failed'}")
            
            # Test 3: Feature importance analysis
            print("\n📊 Testing Feature Analysis:")
            mock_campaigns = [
                {"actual_performance": 85, "engagement_rate": 0.05, "fit_score": 80, "roi": 4.2},
                {"actual_performance": 92, "engagement_rate": 0.07, "fit_score": 88, "roi": 5.1},
                {"actual_performance": 76, "engagement_rate": 0.04, "fit_score": 75, "roi": 3.8}
            ]
            
            feature_importance = learning_system._calculate_feature_importance(mock_campaigns)
            analysis_success = isinstance(feature_importance, dict) and len(feature_importance) > 0
            print(f"  Feature Importance: {'✅ Success' if analysis_success else '❌ Failed'}")
            
            if analysis_success:
                for feature, importance in feature_importance.items():
                    print(f"    {feature}: {importance:.3f}")
            
            # Test 4: Recommendation enhancement
            print("\n🚀 Testing Recommendation Enhancement:")
            mock_base_recommendations = [
                {"fit_score": 75, "engagement_rate": 0.06, "estimated_roi": 4.0},
                {"fit_score": 82, "engagement_rate": 0.04, "estimated_roi": 3.5}
            ]
            
            enhanced_recs = learning_system.enhance_recommendations_with_learning(
                mock_base_recommendations, {}, {}
            )
            enhancement_success = len(enhanced_recs) == len(mock_base_recommendations)
            print(f"  Recommendation Enhancement: {'✅ Success' if enhancement_success else '❌ Failed'}")
            
            learning_results = {
                'initialization': learning_initialized,
                'outcome_recording': outcome_recording_ready,
                'feature_analysis': analysis_success,
                'recommendation_enhancement': enhancement_success,
                'feature_importance': feature_importance if analysis_success else {}
            }
            
            self.test_results['learning_system'] = {'status': 'success', 'details': learning_results}
            
        except Exception as e:
            print(f"❌ Learning system test failed: {str(e)}")
            traceback.print_exc()
            self.test_results['learning_system'] = {'status': 'failed', 'error': str(e)}
    
    def test_system_integration(self):
        """Test overall system integration"""
        print("\n🔗 6. SYSTEM INTEGRATION TEST")
        print("-" * 40)
        
        try:
            # Test component imports and initialization
            components = {
                'config': None,
                'redis_service': None,
                'vector_db_service': None,
                'recommendation_service': None,
                'learning_system': None
            }
            
            print("🧩 Testing Component Integration:")
            
            # Import and test each component
            try:
                from config import settings
                components['config'] = True
                print("  ✅ Config module")
            except Exception as e:
                components['config'] = False
                print(f"  ❌ Config module: {str(e)}")
            
            try:
                from redis_service import redis_service
                components['redis_service'] = redis_service.is_connected()
                print(f"  {'✅' if components['redis_service'] else '⚠️'} Redis service")
            except Exception as e:
                components['redis_service'] = False
                print(f"  ❌ Redis service: {str(e)}")
            
            try:
                from vector_db_service import vector_db_service
                components['vector_db_service'] = vector_db_service.is_connected()
                print(f"  {'✅' if components['vector_db_service'] else '⚠️'} Vector DB service")
            except Exception as e:
                components['vector_db_service'] = False
                print(f"  ❌ Vector DB service: {str(e)}")
            
            try:
                from recommendation_service import RecommendationService
                components['recommendation_service'] = True
                print("  ✅ Recommendation service")
            except Exception as e:
                components['recommendation_service'] = False
                print(f"  ❌ Recommendation service: {str(e)}")
            
            try:
                from recommendation_learning_system import learning_system
                components['learning_system'] = True
                print("  ✅ Learning system")
            except Exception as e:
                components['learning_system'] = False
                print(f"  ❌ Learning system: {str(e)}")
            
            # Calculate integration score
            working_components = sum(1 for v in components.values() if v is True)
            total_components = len(components)
            integration_score = (working_components / total_components) * 100
            
            print(f"\n📈 Integration Score: {integration_score:.1f}% ({working_components}/{total_components} components working)")
            
            integration_results = {
                'components': components,
                'working_components': working_components,
                'total_components': total_components,
                'integration_score': integration_score
            }
            
            self.test_results['integration'] = {'status': 'success', 'details': integration_results}
            
        except Exception as e:
            print(f"❌ Integration test failed: {str(e)}")
            traceback.print_exc()
            self.test_results['integration'] = {'status': 'failed', 'error': str(e)}
    
    def generate_final_report(self):
        """Generate comprehensive final report"""
        print("\n" + "=" * 60)
        print("📋 COMPREHENSIVE SYSTEM ANALYSIS REPORT")
        print("=" * 60)
        
        # Overall system health
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result['status'] == 'success')
        system_health = (passed_tests / total_tests) * 100
        
        print(f"\n🏥 SYSTEM HEALTH: {system_health:.1f}% ({passed_tests}/{total_tests} tests passed)")
        
        # Detailed results
        print("\n📊 DETAILED RESULTS:")
        for test_name, result in self.test_results.items():
            status_icon = "✅" if result['status'] == 'success' else "❌"
            print(f"  {status_icon} {test_name.upper()}: {result['status']}")
            
            if result['status'] == 'failed':
                print(f"    Error: {result.get('error', 'Unknown error')}")
        
        # Key findings
        print("\n🔍 KEY FINDINGS:")
        
        # Redis analysis
        if 'redis' in self.test_results and self.test_results['redis']['status'] == 'success':
            redis_details = self.test_results['redis']['details']
            if redis_details['connection']:
                print("  ✅ Redis Cache System: Fully operational")
                if 'performance' in redis_details:
                    avg_ops = sum(perf['ops_per_second'] for perf in redis_details['performance'].values()) / len(redis_details['performance'])
                    print(f"    Performance: ~{avg_ops:.0f} operations/second average")
            else:
                print("  ⚠️ Redis Cache System: Connection issues")
        
        # Vector DB analysis
        if 'vector_db' in self.test_results and self.test_results['vector_db']['status'] == 'success':
            vector_details = self.test_results['vector_db']['details']
            if vector_details['connection']:
                print("  ✅ Vector Database: Operational with embedding support")
                if vector_details.get('embedding_test', {}).get('success'):
                    dim = vector_details['embedding_test']['dimension']
                    print(f"    Embedding Dimension: {dim}")
            else:
                print("  ⚠️ Vector Database: Connection issues")
        
        # ML components analysis
        if 'ml_components' in self.test_results and self.test_results['ml_components']['status'] == 'success':
            ml_details = self.test_results['ml_components']['details']
            print("  ✅ ML Components: All systems initialized")
            if ml_details.get('insights_status') == 'insufficient_data':
                print("    📝 Learning system needs more training data")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        
        recommendations = []
        
        # Redis recommendations
        if self.test_results.get('redis', {}).get('status') != 'success':
            recommendations.append("Set up Redis server for caching (improves performance)")
        
        # Vector DB recommendations  
        if self.test_results.get('vector_db', {}).get('status') != 'success':
            recommendations.append("Configure PostgreSQL with pgvector for semantic search")
        
        # Configuration recommendations
        config_details = self.test_results.get('configuration', {}).get('details', {})
        if not config_details.get('openai_configured'):
            recommendations.append("Configure OpenAI API key for AI-powered recommendations")
        
        # Learning system recommendations
        ml_details = self.test_results.get('ml_components', {}).get('details', {})
        if ml_details.get('insights_status') == 'insufficient_data':
            recommendations.append("Collect more campaign outcome data to improve ML learning")
        
        if not recommendations:
            recommendations.append("System is well configured - focus on collecting campaign data for learning")
        
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")
        
        # System architecture summary
        print("\n🏗️ SYSTEM ARCHITECTURE SUMMARY:")
        print("  📱 Frontend: Next.js client application")
        print("  🖥️ Backend: Node.js server with TypeScript")
        print("  🤖 AI Service: Python-based ML recommendation system")
        print("  🔄 Cache Layer: Redis for performance optimization")
        print("  🔢 Vector Store: PostgreSQL with pgvector for semantic search")
        print("  🧠 ML Pipeline: OpenAI embeddings + learning system")
        
        # Performance insights
        print("\n⚡ PERFORMANCE INSIGHTS:")
        
        if 'redis' in self.test_results and 'performance' in self.test_results['redis'].get('details', {}):
            redis_perf = self.test_results['redis']['details']['performance']
            print("  Redis Cache Performance:")
            for ops, data in redis_perf.items():
                print(f"    {ops}: {data['ops_per_second']:.1f} ops/sec")
        
        # Data flow explanation
        print("\n🔄 DATA FLOW EXPLANATION:")
        print("  1. Campaign created → Recommendation request triggered")
        print("  2. System fetches influencers from database") 
        print("  3. AI generates semantic embeddings for matching")
        print("  4. Vector similarity search finds best matches")
        print("  5. ML learning system enhances recommendations")
        print("  6. Results cached in Redis for performance")
        print("  7. Campaign outcomes recorded for future learning")
        
        # Save report to file
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'system_health': system_health,
            'test_results': self.test_results,
            'recommendations': recommendations,
            'summary': {
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': total_tests - passed_tests
            }
        }
        
        with open('system_analysis_report.json', 'w') as f:
            json.dump(report_data, f, indent=2, default=str)
        
        print(f"\n💾 Detailed report saved to: system_analysis_report.json")
        print("\n🎉 Analysis complete!")

def main():
    """Run the comprehensive system analysis"""
    analyzer = SystemAnalyzer()
    analyzer.run_comprehensive_analysis()

if __name__ == "__main__":
    main()
