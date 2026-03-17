import re
from urllib.parse import urlparse
from fastapi import Header, HTTPException


IP_RE = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")


def sanitize_url(raw_url: str) -> str:
    url = raw_url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    parsed = urlparse(url)
    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL")

    if len(url) > 2048:
        raise HTTPException(status_code=400, detail="URL too long")

    return url


def extract_user_id(authorization: str | None = Header(default=None)) -> str | None:
    if not authorization:
        return None
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return parts[1]
