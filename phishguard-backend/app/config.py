from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PhishGuard API"
    app_env: str = "dev"
    secret_key: str = "change-me"

    model_path: str = "app/ml_model/model.pkl"
    model_meta_path: str = "app/ml_model/model_meta.json"

    supabase_url: str = ""
    supabase_key: str = ""

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_tls: bool = True

    rate_limit_per_minute: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
