"""Application configuration."""

from os import getenv
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


def _parse_cors_origins(value: str | None) -> list[str]:
    if not value:
        return ["*"]

    origins = [origin.strip() for origin in value.split(",") if origin.strip()]
    return origins or ["*"]


class Settings:
    app_name = getenv("APP_NAME", "Online Code Edit Backend")
    mongodb_uri = getenv("MONGODB_URI")
    mongodb_db_name = getenv("MONGODB_DB_NAME")
    mongodb_collection_name = getenv("MONGODB_COLLECTION_NAME", "files")
    cors_origins = _parse_cors_origins(getenv("CORS_ORIGINS"))
    temp_dir = Path(getenv("TEMP_DIR", str(BASE_DIR / "temp"))).resolve()

    def validate(self) -> None:
        if not self.mongodb_uri:
            raise ValueError("MONGODB_URI is required for database connection.")


settings = Settings()
settings.validate()
