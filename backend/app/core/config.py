"""Application configuration."""

from os import getenv
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Settings:
    app_name = getenv("APP_NAME", "Online Code Edit Backend")
    mongodb_uri = getenv(
        "MONGODB_URI",
        getenv(
            "mongobd",
            "mongodb+srv://ekroopsinghvasir_db_user:Ekroop_05@cluster0.bzzf6cb.mongodb.net/",
        ),
    )
    mongodb_db_name = getenv("MONGODB_DB_NAME", "online_code_edit")
    mongodb_collection_name = getenv("MONGODB_COLLECTION_NAME", "files")


settings = Settings()
