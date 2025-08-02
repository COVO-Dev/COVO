import logging
import psycopg2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from config import settings
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorDBService:
    def __init__(self):
        self.conn = None
        self.openai_client = OpenAI(api_key=settings.openai_api_key)
        
        if settings.vector_db_enabled:
            self.connect()
            self.initialize_db()
    
    def connect(self) -> bool:
        """Connect to PostgreSQL with pgvector extension"""
        try:
            self.conn = psycopg2.connect(
                host=settings.vector_db_host,
                port=settings.vector_db_port,
                user=settings.vector_db_user,
                password=settings.vector_db_password,
                dbname=settings.vector_db_name
            )
            logger.info("Successfully connected to Vector Database")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Vector Database: {str(e)}")
            self.conn = None
            return False
    
    def is_connected(self) -> bool:
        """Check if database connection is active"""
        if not self.conn:
            return False
        try:
            # Try a simple query to check connection
            with self.conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            return True
        except:
            return False
    
    def initialize_db(self) -> bool:
        """Initialize the vector database with required tables and extensions"""
        if not self.is_connected():
            logger.warning("Vector DB not connected, cannot initialize")
            return False
        
        try:
            with self.conn.cursor() as cursor:
                # Create pgvector extension if it doesn't exist
                cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                
                # Create influencers table with vector embeddings
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS influencer_embeddings (
                    id SERIAL PRIMARY KEY,
                    influencer_id TEXT UNIQUE NOT NULL,
                    embedding vector(1536),
                    metadata JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """)
                
                # Create brands table with vector embeddings
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS brand_embeddings (
                    id SERIAL PRIMARY KEY,
                    brand_id TEXT UNIQUE NOT NULL,
                    embedding vector(1536),
                    metadata JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """)
                
                # Create index for faster similarity search
                cursor.execute("""
                CREATE INDEX IF NOT EXISTS influencer_embedding_idx 
                ON influencer_embeddings 
                USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
                """)
                
                cursor.execute("""
                CREATE INDEX IF NOT EXISTS brand_embedding_idx 
                ON brand_embeddings 
                USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
                """)
                
                # Create feedback table for learning from recommendations
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS recommendation_feedback (
                    id SERIAL PRIMARY KEY,
                    campaign_id TEXT NOT NULL,
                    influencer_id TEXT NOT NULL,
                    brand_id TEXT NOT NULL,
                    accepted BOOLEAN,
                    feedback_text TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """)
                
                self.conn.commit()
                logger.info("Vector database initialized successfully")
                return True
        except Exception as e:
            logger.error(f"Error initializing vector database: {str(e)}")
            self.conn.rollback()
            return False
    
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding vector for text using OpenAI API"""
        try:
            response = self.openai_client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return None
    
    def store_influencer_embedding(self, influencer_id: str, influencer_data: Dict[str, Any]) -> bool:
        """Store influencer embedding in vector database"""
        if not settings.vector_db_enabled or not self.is_connected():
            logger.warning("Vector DB not enabled or connected, skipping embedding storage")
            return False
        
        try:
            # Create text representation of influencer for embedding
            text_for_embedding = f"""
            Influencer: {influencer_data.get('firstName', '')} {influencer_data.get('lastName', '')}
            Username: {influencer_data.get('username', '')}
            Bio: {influencer_data.get('personalBio', '')}
            Followers: {influencer_data.get('followers', 0)}
            Engagement Rate: {influencer_data.get('engagement_rate', 0)}
            Content: {influencer_data.get('contentAndAudience', {}).get('content_types', [])}
            Audience: {influencer_data.get('contentAndAudience', {}).get('audience_demographics', {})}
            Location: {influencer_data.get('location', '')}
            """
            
            # Generate embedding
            embedding = self.generate_embedding(text_for_embedding)
            if not embedding:
                return False
            
            # Store in database
            with self.conn.cursor() as cursor:
                cursor.execute("""
                INSERT INTO influencer_embeddings (influencer_id, embedding, metadata)
                VALUES (%s, %s, %s)
                ON CONFLICT (influencer_id) 
                DO UPDATE SET embedding = %s, metadata = %s, updated_at = CURRENT_TIMESTAMP
                """, (
                    influencer_id, 
                    embedding, 
                    psycopg2.extras.Json(influencer_data),
                    embedding,
                    psycopg2.extras.Json(influencer_data)
                ))
                self.conn.commit()
                
            logger.info(f"Stored embedding for influencer {influencer_id}")
            return True
        except Exception as e:
            logger.error(f"Error storing influencer embedding: {str(e)}")
            if self.conn:
                self.conn.rollback()
            return False
    
    def find_similar_influencers(self, query_embedding: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        """Find similar influencers using vector similarity search"""
        if not settings.vector_db_enabled or not self.is_connected():
            logger.warning("Vector DB not enabled or connected, cannot perform similarity search")
            return []
        
        try:
            with self.conn.cursor() as cursor:
                cursor.execute("""
                SELECT influencer_id, metadata, 
                       1 - (embedding <=> %s) as similarity
                FROM influencer_embeddings
                ORDER BY similarity DESC
                LIMIT %s
                """, (query_embedding, limit))
                
                results = []
                for row in cursor.fetchall():
                    influencer_id, metadata, similarity = row
                    results.append({
                        "influencer_id": influencer_id,
                        "metadata": metadata,
                        "similarity_score": similarity
                    })
                
                return results
        except Exception as e:
            logger.error(f"Error finding similar influencers: {str(e)}")
            return []
    
    def store_recommendation_feedback(self, campaign_id: str, influencer_id: str, 
                                     brand_id: str, accepted: bool, 
                                     feedback_text: Optional[str] = None) -> bool:
        """Store feedback on recommendations for learning"""
        if not settings.vector_db_enabled or not self.is_connected():
            logger.warning("Vector DB not enabled or connected, cannot store feedback")
            return False
        
        try:
            with self.conn.cursor() as cursor:
                cursor.execute("""
                INSERT INTO recommendation_feedback 
                (campaign_id, influencer_id, brand_id, accepted, feedback_text)
                VALUES (%s, %s, %s, %s, %s)
                """, (campaign_id, influencer_id, brand_id, accepted, feedback_text))
                self.conn.commit()
                
            logger.info(f"Stored feedback for recommendation: campaign={campaign_id}, influencer={influencer_id}")
            return True
        except Exception as e:
            logger.error(f"Error storing recommendation feedback: {str(e)}")
            if self.conn:
                self.conn.rollback()
            return False

# Create a singleton instance
vector_db_service = VectorDBService()