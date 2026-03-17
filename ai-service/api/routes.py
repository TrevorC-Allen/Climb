from fastapi import APIRouter, HTTPException
from services.analysis_service import AnalysisService
from services.recommendation_service import RecommendationService

router = APIRouter()

analysis_service = AnalysisService()
recommendation_service = RecommendationService()


@router.get("/analysis/stats/{user_id}")
async def get_user_stats(user_id: str):
    try:
        stats = await analysis_service.get_user_stats(user_id)
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/progress/{user_id}")
async def get_user_progress(user_id: str):
    try:
        progress = await analysis_service.get_user_progress(user_id)
        return {"success": True, "data": progress}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    try:
        recommendations = await recommendation_service.get_recommendations(user_id)
        return {"success": True, "data": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/next-grade/{user_id}")
async def get_next_grade_recommendation(user_id: str):
    try:
        recommendation = await recommendation_service.get_next_grade_recommendation(user_id)
        return {"success": True, "data": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
