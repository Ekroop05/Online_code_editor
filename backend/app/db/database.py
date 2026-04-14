from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.core.config import settings
from app.utils.logger import get_logger


logger = get_logger(__name__)

client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)

db = client[settings.mongodb_db_name]

files_collection = db[settings.mongodb_collection_name]


def verify_mongodb_connection() -> None:
    """Force an actual MongoDB connection attempt and log the result."""
    try:
        client.admin.command("ping")
        logger.info("MongoDB connected to database '%s'", settings.mongodb_db_name)
    except PyMongoError:
        logger.exception("MongoDB connection failed")
        raise
