import re
from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "bank",
    "paypal",
    "password",
    "confirm",
]

IP_IN_URL = re.compile(r"(?:(?:\d{1,3}\.){3}\d{1,3})")


def _registrable_domain(host: str) -> str:
    parts = [p for p in host.split(".") if p]
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host


def extract_features(url: str) -> dict[str, float]:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    path = parsed.path.lower()
    full = url.lower()

    url_length = len(url)
    dot_count = full.count(".")
    at_symbol = 1.0 if "@" in full else 0.0
    uses_ip = 1.0 if IP_IN_URL.search(host) else 0.0
    subdomains = max(dot_count - 1, 0)
    https_usage = 1.0 if parsed.scheme == "https" else 0.0
    registrable = _registrable_domain(host)
    base_label = registrable.split(".")[0] if registrable else ""
    suspicious_keywords = sum(
        1
        for k in SUSPICIOUS_KEYWORDS
        if k in full and k != base_label
    )
    special_chars = sum(full.count(ch) for ch in ["-", "_", "=", "?", "%", "&", "//"])

    # Align these fields with available Kaggle/UCI-style columns for training.
    return {
        "LongURL": 1.0 if url_length > 75 else 0.0,
        "SubDomains": float(subdomains),
        "Symbol@": at_symbol,
        "UsingIP": uses_ip,
        "HTTPS": 1.0 if https_usage else -1.0,
        "PrefixSuffix-": 1.0 if "-" in host else 0.0,
        "Redirecting//": 1.0 if url.rfind("//") > 7 else 0.0,
        "ShortURL": 1.0 if any(s in host for s in ["bit.ly", "t.co", "tinyurl", "goo.gl"]) else 0.0,
        "AbnormalURL": 1.0 if path.count("/") > 6 else 0.0,
        "suspicious_keywords": float(suspicious_keywords),
        "url_length": float(url_length),
        "dot_count": float(dot_count),
        "special_chars": float(special_chars),
    }


def build_explanation(features: dict[str, float]) -> list[str]:
    reasons: list[str] = []
    if features.get("UsingIP", 0) > 0:
        reasons.append("URL uses an IP address instead of a domain")
    if features.get("Symbol@", 0) > 0:
        reasons.append("Contains '@' symbol often used to obfuscate destination")
    if features.get("PrefixSuffix-", 0) > 0:
        reasons.append("Domain contains '-' which is common in spoofed brands")
    if features.get("suspicious_keywords", 0) >= 2:
        reasons.append("Contains multiple phishing-related keywords")
    if features.get("LongURL", 0) > 0:
        reasons.append("Long URL structure can hide malicious intent")
    if features.get("SubDomains", 0) >= 3:
        reasons.append("High number of subdomains can indicate deception")
    if not reasons:
        reasons.append("No high-risk URL patterns detected")
    return reasons
