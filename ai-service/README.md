# Climbing AI Service

AI-powered analytics and recommendations for climbers.

## Features

- User statistics analysis
- Progress tracking
- Personalized recommendations
- Next grade suggestions

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your configuration

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/v1/analysis/stats/{user_id}` - Get user stats
- `GET /api/v1/analysis/progress/{user_id}` - Get user progress
- `GET /api/v1/recommendations/{user_id}` - Get recommendations
- `GET /api/v1/recommendations/next-grade/{user_id}` - Get next grade recommendation
