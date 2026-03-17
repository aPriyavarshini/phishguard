import smtplib
from email.message import EmailMessage

from app.config import settings


def send_threat_alert(to_email: str, url: str, risk_score: str) -> bool:
    if not to_email:
        return False
    if not settings.smtp_host or not settings.smtp_from:
        return False

    message = EmailMessage()
    message["Subject"] = "PhishGuard Alert: Threat detected"
    message["From"] = settings.smtp_from
    message["To"] = to_email
    message.set_content(
        "\n".join(
            [
                "PhishGuard has detected a potential phishing threat.",
                f"URL: {url}",
                f"Risk level: {risk_score}",
                "",
                "If you did not trigger this scan, reset your credentials and review recent activity.",
            ]
        )
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            if settings.smtp_tls:
                smtp.starttls()
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(message)
        return True
    except Exception:
        return False
