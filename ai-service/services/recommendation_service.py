import httpx
from typing import Dict, List, Any
from config import settings


class RecommendationService:
    def __init__(self):
        self.backend_url = settings.BACKEND_API_URL

    async def get_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.backend_url}/progress/stats",
                    headers={"Authorization": f"Bearer {user_id}"}
                )
                response.raise_for_status()
                stats = response.json()
                
                return self._generate_recommendations(stats)
            except httpx.HTTPError:
                return []

    async def get_next_grade_recommendation(self, user_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.backend_url}/progress/stats",
                    headers={"Authorization": f"Bearer {user_id}"}
                )
                response.raise_for_status()
                stats = response.json()
                
                return self._generate_next_grade_recommendation(stats)
            except httpx.HTTPError:
                return {"error": "Could not fetch stats"}

    def _generate_recommendations(self, stats: Dict) -> List[Dict[str, str]]:
        recommendations = []
        
        by_type = stats.get("by_type", {})
        if by_type.get("boulder", 0) > by_type.get("lead", 0) * 2:
            recommendations.append({
                "type": "variety",
                "description": "Try more lead climbing to balance your skills",
                "reason": "You're mostly bouldering, which is great for power!",
                "confidence": 0.8,
            })
        
        if stats.get("first_try_rate", 0) < 30:
            recommendations.append({
                "type": "reading",
                "description": "Practice route reading before climbing",
                "reason": "Your first try rate is low, try studying the route first",
                "confidence": 0.7,
            })
        
        return recommendations

    def _generate_next_grade_recommendation(self, stats: Dict) -> Dict[str, Any]:
        by_grade = stats.get("by_grade", {})
        
        if not by_grade:
            return {
                "recommended_grade": "VB",
                "suggested_routes": ["Start with easy boulder problems", "Focus on technique"],
                "training_focus": "Foundations",
                "estimated_time": "2-4 weeks",
            }
        
        # Find highest grade climbed
        grades = list(by_grade.keys())
        if grades:
            highest = max(grades, key=lambda x: self._grade_rank(x))
            next_grade = self._next_grade(highest)
        else:
            next_grade = "V0"
        
        return {
            "recommended_grade": next_grade,
            "suggested_routes": [
                f"Practice {next_grade} problems",
                "Focus on your weak points",
                "Try different styles",
            ],
            "training_focus": self._get_training_focus(next_grade),
            "estimated_time": self._get_estimated_time(next_grade),
        }

    def _grade_rank(self, grade: str) -> int:
        grade_order = [
            "VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10",
            "5.10a", "5.10b", "5.10c", "5.10d", "5.11a", "5.11b", "5.11c", "5.11d",
            "5.12a", "5.12b", "5.12c", "5.12d", "5.13a", "5.13b", "5.13c", "5.13d",
            "5.14a", "5.14b", "5.14c", "5.14d", "5.15a", "5.15b", "5.15c", "5.15d",
        ]
        return grade_order.index(grade) if grade in grade_order else -1

    def _next_grade(self, current: str) -> str:
        grade_order = [
            "VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10",
            "5.10a", "5.10b", "5.10c", "5.10d", "5.11a", "5.11b", "5.11c", "5.11d",
            "5.12a", "5.12b", "5.12c", "5.12d", "5.13a", "5.13b", "5.13c", "5.13d",
            "5.14a", "5.14b", "5.14c", "5.14d", "5.15a", "5.15b", "5.15c", "5.15d",
        ]
        idx = grade_order.index(current) if current in grade_order else -1
        return grade_order[idx + 1] if idx < len(grade_order) - 1 else current

    def _get_training_focus(self, grade: str) -> str:
        if grade in ["VB", "V0", "V1"]:
            return "Technique & Consistency"
        elif grade in ["V2", "V3", "V4"]:
            return "Power & Movement"
        elif grade in ["V5", "V6", "V7"]:
            return "Strength & Endurance"
        else:
            return "Advanced Power & Mental Game"

    def _get_estimated_time(self, grade: str) -> str:
        if grade in ["VB", "V0", "V1"]:
            return "1-2 weeks"
        elif grade in ["V2", "V3", "V4"]:
            return "2-4 weeks"
        elif grade in ["V5", "V6", "V7"]:
            return "1-2 months"
        else:
            return "2-4 months"
