from fastapi import APIRouter, Depends

from app.services.supabase_service import get_current_user, supabase_service

router = APIRouter(prefix="/api", tags=["alerts"])


@router.get("/alerts")
def get_alerts(user: dict = Depends(get_current_user)):
    return supabase_service.get_alerts(user["id"])
