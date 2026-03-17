from fastapi import APIRouter, Depends

from app.services.supabase_service import get_current_user, supabase_service

router = APIRouter(prefix="/api", tags=["threats"])


@router.get("/threats")
def get_threats(user: dict = Depends(get_current_user)):
    return supabase_service.get_threats(user["id"])
