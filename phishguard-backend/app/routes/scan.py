import time

from fastapi import APIRouter, Depends, Request
from slowapi.errors import RateLimitExceeded

from app.models.schemas import ScanRequest, ScanResponse
from app.services.email_service import send_threat_alert
from app.services.ml_service import ml_service
from app.services.rate_limiter import limiter
from app.services.supabase_service import get_current_user, supabase_service
from app.utils.security import sanitize_url
from app.utils.url_features import build_explanation, extract_features

router = APIRouter(prefix="/api", tags=["scan"])


@router.post("/scan", response_model=ScanResponse)
@limiter.limit("20/minute")
def scan_url(
    request: Request,
    payload: ScanRequest,
    user: dict = Depends(get_current_user),
):
    start = time.perf_counter()
    url = sanitize_url(payload.url)
    features = extract_features(url)

    pred, phishing_prob = ml_service.predict(features)
    # Use probability threshold to decide class; model.predict can be noisy on edge cases.
    prediction = "Phishing" if phishing_prob >= 0.5 else "Legitimate"
    # Heuristic override for clearly suspicious URLs the model underestimates.
    if prediction == "Legitimate":
        if (
            features.get("suspicious_keywords", 0) >= 2
            and features.get("PrefixSuffix-", 0) > 0
            and features.get("HTTPS", 1) < 0
        ):
            prediction = "Phishing"
            phishing_prob = max(phishing_prob, 0.55)
    confidence = phishing_prob if prediction == "Phishing" else 1.0 - phishing_prob

    if prediction == "Phishing":
        if phishing_prob >= 0.85:
            risk_score = "High"
        elif phishing_prob >= 0.6:
            risk_score = "Medium"
        else:
            risk_score = "Low"
    else:
        risk_score = "Low"

    safety_score = int(max(0, min(100, (1.0 - phishing_prob) * 100)))
    explanation = build_explanation(features)

    elapsed_ms = (time.perf_counter() - start) * 1000

    supabase_service.save_scan(
        user["id"],
        {
            "url": url,
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "risk_score": risk_score,
            "safety_score": safety_score,
            "scan_time": round(elapsed_ms, 2),
        },
    )

    if prediction == "Phishing":
        send_threat_alert(user.get("email", ""), url, risk_score)

    return ScanResponse(
        url=url,
        prediction=prediction,
        confidence=round(confidence, 4),
        risk_score=risk_score,
        safety_score=safety_score,
        explanation=explanation,
        features=features,
    )
