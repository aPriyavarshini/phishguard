from fastapi import APIRouter, Depends

from app.models.schemas import AnalyticsResponse
from app.services.supabase_service import get_current_user, supabase_service

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(user: dict = Depends(get_current_user)):
    return supabase_service.get_analytics(user["id"])
