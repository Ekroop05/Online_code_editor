from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.core.config import settings
from app.utils.logger import get_logger


logger = get_logger(__name__)

client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)


def _get_database():
    if settings.mongodb_db_name:
        return client[settings.mongodb_db_name]

    try:
        return client.get_default_database()
    except Exception as exc:
        raise ValueError(
            "No MongoDB database name was found. Add the database to MONGODB_URI "
            "or set MONGODB_DB_NAME explicitly."
        ) from exc


db = _get_database()

files_collection = db[settings.mongodb_collection_name]


def verify_mongodb_connection() -> None:
    """Force an actual MongoDB connection attempt and log the result."""
    try:
        client.admin.command("ping")
        logger.info("MongoDB connected to database '%s'", db.name)
    except PyMongoError:
        logger.exception("MongoDB connection failed")
        raise
