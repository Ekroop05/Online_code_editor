# Backend

FastAPI backend for the online code editor project.

## Environment variables

Create `backend/.env` from `backend/.env.example` and set:

- `MONGODB_URI`: your MongoDB Atlas connection string
- `MONGODB_DB_NAME`: optional override for the database name if you do not want to use the one embedded in the URI
- `MONGODB_COLLECTION_NAME`: collection name, defaults to `files`
- `CORS_ORIGINS`: comma-separated frontend origins or `*`
- `TEMP_DIR`: writable temp directory for code execution files

## Render deployment

This repo includes a root `render.yaml` for deploying the backend service on Render.

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Set `MONGODB_URI` in Render's environment variables before deploying.
