# Climbing App MVP

A full-stack climbing tracking application with user system, climbing records, progress tracking, and WeChat payment integration.

## Project Structure

```
├── backend/          # NestJS Backend API
├── mobile-app/       # React Native / Expo Mobile App
└── ai-service/       # Python AI Service for analytics
```

## Features

### Backend (NestJS)
- User authentication (JWT)
- Climbing records management
- Progress tracking & statistics
- WeChat payment integration
- SQLite database

### Mobile App (Expo)
- User registration & login
- Record climbing sessions
- View climbing history
- Progress tracking with charts
- Profile management
- Payment screen

### AI Service (Python)
- User statistics analysis
- Progress tracking
- Personalized recommendations
- Next grade suggestions

## Setup

### Backend
```bash
cd backend/backend
npm install
cp .env.example .env
npm run start:dev
```

### Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

## API Endpoints

### Users
- `POST /users/register` - Register new user
- `POST /users/login` - Login
- `GET /users/profile` - Get user profile (auth required)

### Climbing Records
- `POST /climbing-records` - Create record (auth required)
- `GET /climbing-records` - Get all records (auth required)
- `GET /climbing-records/:id` - Get record by ID (auth required)

### Progress
- `GET /progress/stats` - Get user statistics (auth required)
- `GET /progress/history` - Get activity history (auth required)

### Payments
- `POST /payments` - Create payment order (auth required)
- `GET /payments` - Get user payments (auth required)
- `GET /payments/orders/:orderId` - Get order by ID (auth required)

### AI Service
- `GET /api/v1/analysis/stats/{user_id}` - Get user stats
- `GET /api/v1/analysis/progress/{user_id}` - Get user progress
- `GET /api/v1/recommendations/{user_id}` - Get recommendations
- `GET /api/v1/recommendations/next-grade/{user_id}` - Get next grade recommendation
