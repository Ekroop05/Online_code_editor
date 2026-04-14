import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import collaboration, execute, file
from app.db.database import verify_mongodb_connection
from app.services.file_service import remove_legacy_seed_files


logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(execute.router)
app.include_router(file.router)
app.include_router(collaboration.router)


@app.on_event("startup")
def startup_event():
    verify_mongodb_connection()
    removed_count = remove_legacy_seed_files()
    logging.getLogger(__name__).info("Removed %s legacy seed files", removed_count)

@app.get("/")
def root():
    return {"message": "Backend is running "}
