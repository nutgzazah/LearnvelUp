from pydantic import BaseModel
from typing import List, Optional


class RecommendRequest(BaseModel):
    user_id: str
    top_k: int = 10


class CourseScore(BaseModel):
    course_id: int
    title: str
    score: float
    main_category: Optional[str]
    sub_categories: List[str]
    cover_image_url: Optional[str]  # ส่งมาให้ frontend แสดง thumbnail
    price_coins: Optional[int]      # ส่งมาให้ frontend แสดงราคา


class RecommendResponse(BaseModel):
    recommendations: List[CourseScore]
    is_cold_start: bool = False