import httpx
from typing import Dict, List, Any
from config import settings


class AnalysisService:
    def __init__(self):
        self.backend_url = settings.BACKEND_API_URL

    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.backend_url}/progress/stats",
                    headers={"Authorization": f"Bearer {user_id}"}
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                return {"error": str(e)}

    async def get_user_progress(self, user_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.backend_url}/progress/history",
                    headers={"Authorization": f"Bearer {user_id}"}
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                return {"error": str(e)}

    async def analyze_performance(self, user_id: str) -> Dict[str, Any]:
        stats = await self.get_user_stats(user_id)
        progress = await self.get_user_progress(user_id)
        
        return {
            "stats": stats,
            "progress": progress,
            "analysis": self._generate_analysis(stats, progress),
        }

    def _generate_analysis(self, stats: Dict, progress: Dict) -> Dict[str, str]:
        analysis = {}
        
        if stats.get("first_try_rate", 0) > 50:
            analysis["first_try"] = "Great job! You're consistently climbing on your first try."
        else:
            analysis["first_try"] = "Keep practicing! Try focusing on reading routes before you start."
        
        if stats.get("avg_attempts", 0) > 3:
            analysis["attempts"] = "You're persistent! Consider breaking down difficult moves."
        else:
            analysis["attempts"] = "Efficient climbing! You're solving routes quickly."
        
        return analysis
