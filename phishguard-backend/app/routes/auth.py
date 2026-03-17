from fastapi import APIRouter, Depends

from app.services.supabase_service import get_current_user

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user.get("email")}
