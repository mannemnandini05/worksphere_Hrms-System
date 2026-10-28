from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    secret_key: str = "dev-only-change-me"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./worksphere.db"
    frontend_origins: str = "http://localhost:5173"
    upload_dir: str = "uploads"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
