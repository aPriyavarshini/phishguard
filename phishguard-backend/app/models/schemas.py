from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl


class ScanRequest(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048)


class ScanResponse(BaseModel):
    url: str
    prediction: str
    confidence: float
    risk_score: str
    safety_score: int
    explanation: list[str]
    features: dict[str, float]


class AnalyticsResponse(BaseModel):
    total_scans: int
    threats_detected: int
    safe_urls: int
    average_scan_time_ms: float
    threat_trend: list[dict]
    category_breakdown: list[dict]


class HistoryItem(BaseModel):
    id: str | int
    url: str
    prediction: str
    confidence: float
    risk_score: str
    safety_score: int
    scan_time: float
    created_at: datetime


class ThreatItem(BaseModel):
    domain: str
    threat_level: str
    detected_at: datetime
    scan_count: int


class AlertItem(BaseModel):
    id: str | int
    title: str
    message: str
    level: str
    created_at: datetime
    url: str | None = None


class ExportFormatRequest(BaseModel):
    format: str = Field(pattern="^(csv|pdf)$")
