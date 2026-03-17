from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import Depends, Header, HTTPException
from postgrest.exceptions import APIError
from supabase import Client, create_client

from app.config import settings


class SupabaseService:
    def __init__(self) -> None:
        self.client: Client | None = None

    def get_client(self) -> Client | None:
        if not settings.supabase_url or not settings.supabase_key:
            return None
        if self.client is None:
            self.client = create_client(settings.supabase_url, settings.supabase_key)
        return self.client

    def get_user(self, jwt_token: str) -> dict[str, Any]:
        client = self.get_client()
        if not client:
            # Local fallback mode for development without Supabase keys.
            return {"id": "local-dev-user", "email": "dev@local"}

        try:
            result = client.auth.get_user(jwt_token)
        except Exception as exc:
            raise HTTPException(status_code=401, detail="Invalid token") from exc

        if not result or not result.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": result.user.id, "email": result.user.email}

    def save_scan(self, user_id: str, payload: dict[str, Any]) -> None:
        client = self.get_client()
        if not client:
            return
        try:
            client.table("scans").insert({"user_id": user_id, **payload}).execute()
            if payload.get("prediction") == "Phishing":
                domain = payload.get("url", "")
                if "/" in domain:
                    domain = domain.split("/")[2]
                client.table("threats").insert(
                    {
                        "user_id": user_id,
                        "domain": domain,
                        "threat_level": payload.get("risk_score", "High"),
                    }
                ).execute()
        except APIError:
            # If DB tables/policies are not initialized yet, keep scan API available.
            return

    def get_history(self, user_id: str, limit: int = 100) -> list[dict[str, Any]]:
        client = self.get_client()
        if not client:
            return []
        try:
            response = (
                client.table("scans")
                .select("id,url,prediction,confidence,risk_score,safety_score,scan_time,created_at")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return response.data or []
        except APIError:
            return []

    def get_analytics(self, user_id: str) -> dict[str, Any]:
        history = self.get_history(user_id, limit=1000)
        total = len(history)
        threats = sum(1 for x in history if x.get("prediction") == "Phishing")
        safe = total - threats
        avg_scan = sum(float(x.get("scan_time", 0)) for x in history) / total if total else 0.0

        by_day: dict[str, int] = {}
        categories = {"Phishing": 0, "Legitimate": 0}
        for item in history:
            day = str(item.get("created_at", ""))[:10]
            by_day[day] = by_day.get(day, 0) + 1
            pred = item.get("prediction", "Legitimate")
            categories[pred] = categories.get(pred, 0) + 1

        threat_trend = [{"date": k, "count": v} for k, v in sorted(by_day.items())][-14:]
        category_breakdown = [{"name": k, "value": v} for k, v in categories.items()]

        return {
            "total_scans": total,
            "threats_detected": threats,
            "safe_urls": safe,
            "average_scan_time_ms": round(avg_scan, 2),
            "threat_trend": threat_trend,
            "category_breakdown": category_breakdown,
        }

    def get_threats(self, user_id: str) -> list[dict[str, Any]]:
        client = self.get_client()
        if client:
            try:
                rows = (
                    client.table("threats")
                    .select("domain,threat_level,detected_at")
                    .eq("user_id", user_id)
                    .order("detected_at", desc=True)
                    .limit(250)
                    .execute()
                ).data or []
            except APIError:
                rows = []
            if rows:
                domain_stats: dict[str, int] = {}
                latest_by_domain: dict[str, str] = {}
                for row in rows:
                    domain = row["domain"]
                    domain_stats[domain] = domain_stats.get(domain, 0) + 1
                    latest_by_domain[domain] = row.get("detected_at")
                top = sorted(domain_stats.items(), key=lambda x: x[1], reverse=True)[:10]
                return [
                    {
                        "domain": domain,
                        "threat_level": "High" if count > 5 else "Medium",
                        "detected_at": latest_by_domain.get(domain),
                        "scan_count": count,
                    }
                    for domain, count in top
                ]

        history = [x for x in self.get_history(user_id, limit=500) if x.get("prediction") == "Phishing"]
        domain_stats: dict[str, int] = {}
        for item in history:
            url = item.get("url", "")
            domain = url.split("/")[2] if "/" in url else url
            domain_stats[domain] = domain_stats.get(domain, 0) + 1
        top = sorted(domain_stats.items(), key=lambda x: x[1], reverse=True)[:10]
        now = datetime.now(UTC).isoformat()
        return [
            {
                "domain": domain,
                "threat_level": "High" if count > 5 else "Medium",
                "detected_at": now,
                "scan_count": count,
            }
            for domain, count in top
        ]

    def get_alerts(self, user_id: str) -> list[dict[str, Any]]:
        history = [x for x in self.get_history(user_id, limit=100) if x.get("prediction") == "Phishing"]
        alerts = []
        for item in history[:20]:
            alerts.append(
                {
                    "id": item.get("id"),
                    "title": "Phishing Website Detected",
                    "message": f"Suspicious URL flagged: {item.get('url')}",
                    "level": item.get("risk_score", "High"),
                    "created_at": item.get("created_at"),
                    "url": item.get("url"),
                }
            )
        return alerts


supabase_service = SupabaseService()


def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return supabase_service.get_user(parts[1])
