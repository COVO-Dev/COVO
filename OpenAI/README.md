# COVO Recommendation Service API

## Overview

The COVO Recommendation Service is a FastAPI-based microservice that provides AI-powered influencer recommendations using OpenAI's API. The service automatically generates recommendations when campaigns are created and stores results directly in MongoDB.

## Features

- **Automatic Recommendations**: Triggers when campaigns are created
- **AI-Powered Matching**: Uses OpenAI API for intelligent recommendations
- **Database Integration**: Direct MongoDB operations for all data
- **Token Optimization**: Efficient prompt structure to minimize API costs
- **RESTful API**: FastAPI-based endpoints with automatic documentation
- **Background Processing**: Async recommendation generation
- **Health Monitoring**: Built-in health checks and status monitoring

## API Endpoints

### Health Check
- **GET** `/` - Basic health check
- **GET** `/health` - Detailed health check with database connectivity

### Recommendations
- **POST** `/recommendations/generate` - Generate recommendations for a campaign
- **POST** `/campaigns/auto-recommend` - Auto-generate recommendations (webhook endpoint)
- **GET** `/campaigns/{campaign_id}/recommendations` - Get existing recommendations
- **POST** `/campaigns/{campaign_id}/regenerate-recommendations` - Regenerate recommendations

### Search
- **GET** `/influencers/search` - Search influencers with filters

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o-mini
MAX_TOKENS=1000
TEMPERATURE=0.7

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/main

# API Configuration (optional)
API_HOST=0.0.0.0
API_PORT=8000
```

### 2. Local Development

#### Option A: Using the startup script
```bash
./start_service.sh
```

#### Option B: Manual setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Docker Deployment

#### Build and run with Docker Compose
```bash
docker-compose up --build
```

#### Build and run manually
```bash
docker build -t covo-recommendation-service .
docker run -p 8000:8000 --env-file .env covo-recommendation-service
```

## Integration with Main Backend

### Webhook Integration

When a campaign is created in your main backend, call the auto-recommend endpoint:

```javascript
// Node.js/Express example
async function onCampaignCreated(campaignId) {
    try {
        const response = await fetch('http://localhost:8000/campaigns/auto-recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                campaign_id: campaignId
            })
        });
        
        const result = await response.json();
        console.log('Recommendation generation started:', result);
    } catch (error) {
        console.error('Error triggering recommendations:', error);
    }
}
```

### Manual Recommendation Generation

```javascript
// Generate recommendations manually
async function generateRecommendations(campaignId, brandId) {
    try {
        const response = await fetch('http://localhost:8000/recommendations/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                campaign_id: campaignId,
                brand_id: brandId
            })
        });
        
        const recommendations = await response.json();
        return recommendations;
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw error;
    }
}
```

## Database Schema

### Campaign Document Structure

```json
{
  "_id": "ObjectId",
  "title": "Campaign Title",
  "brandId": "ObjectId",
  "targetAudience": "Description",
  "primaryGoals": ["goal1", "goal2"],
  "influencerType": "Micro",
  "budgetRange": 5000,
  "geographicFocus": "United States",
  "collaborationPreferences": {
    "type": "sponsored_post",
    "styles": ["photo", "video"]
  },
  "recommendedInfluencers": [
    {
      "influencer": {
        "_id": "ObjectId",
        "username": "influencer_username",
        "firstName": "First",
        "lastName": "Last",
        "followers": 25000,
        "contentAndAudience": {...},
        "location": {...},
        "covoScore": {...}
      },
      "recommendationScore": 85,
      "reasoning": "AI-generated reasoning",
      "collaborationType": "sponsored_post",
      "aiGenerated": true,
      "generatedAt": "2025-07-14T..."
    }
  ],
  "lastRecommendationUpdate": "2025-07-14T...",
  "recommendationStatus": "completed"
}
```

## API Usage Examples

### 1. Generate Recommendations

```bash
curl -X POST "http://localhost:8000/recommendations/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "65f1b2a3c4d5e6f7a8b9c0d1",
    "brand_id": "65f1b2a3c4d5e6f7a8b9c0d2"
  }'
```

### 2. Auto-generate on Campaign Creation

```bash
curl -X POST "http://localhost:8000/campaigns/auto-recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "65f1b2a3c4d5e6f7a8b9c0d1"
  }'
```

### 3. Search Influencers

```bash
curl "http://localhost:8000/influencers/search?niche=fashion&location=new+york&min_followers=10000&max_followers=100000&limit=10"
```

### 4. Get Campaign Recommendations

```bash
curl "http://localhost:8000/campaigns/65f1b2a3c4d5e6f7a8b9c0d1/recommendations"
```

## Monitoring and Logs

The service provides comprehensive logging for:
- Recommendation generation processes
- Database operations
- OpenAI API interactions
- Error tracking and debugging

Access logs through:
- Console output during development
- Docker logs: `docker-compose logs recommendation-service`
- Health check endpoint: `GET /health`

## Security Considerations

1. **API Key Security**: Store OpenAI API key securely in environment variables
2. **Database Security**: Use MongoDB authentication in production
3. **Network Security**: Configure CORS appropriately for your frontend domains
4. **Rate Limiting**: Consider implementing rate limiting for production use

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string in `.env`
   - Ensure network connectivity

2. **OpenAI API Errors**
   - Verify API key is valid
   - Check API quota and billing
   - Review rate limits

3. **Import Errors**
   - Ensure all dependencies are installed
   - Check Python version compatibility
   - Verify virtual environment activation

### Getting Help

- Check the FastAPI automatic documentation at `http://localhost:8000/docs`
- Review logs for detailed error messages
- Test individual endpoints using the interactive API docs
