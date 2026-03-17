from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from api.routes import router

app = FastAPI(
    title="Climbing AI Service",
    description="AI-powered climbing analytics and recommendations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Climbing AI Service",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
