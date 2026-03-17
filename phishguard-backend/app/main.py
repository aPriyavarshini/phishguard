from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from app.config import settings
from app.routes import alerts, analytics, auth, history, scan, threats
from app.services.ml_service import ml_service
from app.services.rate_limiter import limiter

app = FastAPI(title=settings.app_name)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(scan.router)
app.include_router(analytics.router)
app.include_router(history.router)
app.include_router(threats.router)
app.include_router(alerts.router)


@app.get("/")
def health():
    return {"status": "ok", "service": settings.app_name}


@app.on_event("startup")
def startup_event():
    try:
        ml_service.load()
    except Exception:
        # Model may not be trained yet in fresh clones.
        pass
