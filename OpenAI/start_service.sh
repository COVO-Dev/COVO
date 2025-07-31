#!/bin/bash

# COVO Recommendation Service Startup Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting COVO Recommendation Service${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo -e "${YELLOW}Creating example .env file...${NC}"
    cat > .env << EOF
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o-mini
MAX_TOKENS=1000
TEMPERATURE=0.7

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/covo

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
EOF
    echo -e "${YELLOW}Please update the .env file with your actual values${NC}"
    exit 1
fi

# Check if MongoDB is running
echo -e "${YELLOW}🔍 Checking MongoDB connection...${NC}"
python3 -c "
from config import settings
from pymongo import MongoClient
try:
    client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=2000)
    client.server_info()
    print('✅ MongoDB connection successful')
except Exception as e:
    print(f'❌ MongoDB connection failed: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ MongoDB connection failed. Please check your MongoDB service.${NC}"
    exit 1
fi

# Start the FastAPI service
echo -e "${GREEN}🌟 Starting FastAPI service on http://localhost:8000${NC}"
echo -e "${YELLOW}📖 API Documentation will be available at http://localhost:8000/docs${NC}"
echo -e "${YELLOW}💡 Health check available at http://localhost:8000/health${NC}"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
