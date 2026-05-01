import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from pathlib import Path
###load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")   ## for local development
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.recommender import Recommender
from app.schemas import RecommendRequest, RecommendResponse
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()
scheduler = AsyncIOScheduler(timezone="Asia/Bangkok")

import os
###print("SUPABASE_URL:", os.getenv("SUPABASE_URL"))
###print("KEY exists:", bool(os.getenv("SUPABASE_SERVICE_KEY")))

# ─── Scheduler function ───────────────────────────────────────────────────────
async def scheduled_retrain():
    logger.info("[scheduler] retrain started")
    try:
        await recommender.build_index()
        logger.info(f"[scheduler] retrain done — {recommender.course_count} courses")
    except Exception as e:
        logger.error(f"[scheduler] retrain failed — {e}")

# ─── Lifespan: build index ตอน startup ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await recommender.build_index()
    print(f"[startup] TF-IDF index built — {recommender.course_count} courses")
    
    # retrain ทุกวันตี 3
    scheduler.add_job(
        scheduled_retrain,
        "cron",
        hour=3,
        minute=0,
    )
    scheduler.start()
    print("[scheduler] started — retrain scheduled at 03:00 Asia/Bangkok")
    yield
    scheduler.shutdown()


app = FastAPI(
    title="LearnVelUp Recommendation Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # จำกัด origin ใน production 
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = Recommender(
    supabase_url=os.getenv("SUPABASE_URL", ""),
    supabase_key=os.getenv("SUPABASE_SERVICE_KEY", ""),
)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "index_built": recommender._built,
        "course_count": recommender.course_count,
    }


@app.post("/recommend", response_model=RecommendResponse)
async def recommend(body: RecommendRequest):
    """
    รับ user_id → คืน list คอร์สที่แนะนำ เรียงจาก score สูงสุด
    score = 0.5*enrollment + 0.3*implicit + 0.2*interest
    """
    try:
        results, is_cold_start = await recommender.get_recommendations(
            user_id=body.user_id,
            top_k=body.top_k,
        )
        return RecommendResponse(
            recommendations=results,
            is_cold_start=is_cold_start,
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/retrain")
async def retrain():
    """
    Rebuild TF-IDF matrix ใหม่จาก Supabase
    เรียกได้เมื่อ: เพิ่มคอร์สใหม่ / schedule รายวัน / แก้ไข category
    """
    try:
        await recommender.build_index()
        return {
            "status": "retrained",
            "course_count": recommender.course_count,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
#cd recommend_service
#venv\Scripts\activate     
#uvicorn app.main:app --reload --host 0.0.0.0 --port 8000