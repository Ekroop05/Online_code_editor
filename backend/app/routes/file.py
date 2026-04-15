from fastapi import APIRouter, HTTPException

from app.models.file import FileCreate, FileNotesUpdate, FileUpdate
from app.services.file_service import (
    create_file,
    delete_file,
    get_all_files,
    get_file_by_id,
    update_file,
    update_file_notes,
)

router = APIRouter()


@router.get("/files")
def list_files():
    files = get_all_files()
    return {"files": files}


@router.post("/files")
def create_new_file(file: FileCreate):
    new_file = create_file(
        name=file.name,
        language=file.language,
        content=file.content or "",
        notes=file.notes or "",
    )
    return new_file


@router.get("/files/{file_id}")
@router.get("/file/{file_id}")
def get_file(file_id: str):
    file = get_file_by_id(file_id)

    if file is None:
        raise HTTPException(status_code=404, detail="File not found")

    return file


@router.put("/files/{file_id}")
@router.put("/file/{file_id}")
def update_existing_file(file_id: str, file_update: FileUpdate):
    updated_file = update_file(file_id, file_update.content)

    if updated_file is None:
        raise HTTPException(status_code=404, detail="File not found")

    return updated_file


@router.put("/files/{file_id}/notes")
@router.put("/file/{file_id}/notes")
def update_existing_file_notes(file_id: str, file_update: FileNotesUpdate):
    updated_file = update_file_notes(file_id, file_update.notes)

    if updated_file is None:
        raise HTTPException(status_code=404, detail="File not found")

    return updated_file


@router.delete("/files/{file_id}")
@router.delete("/file/{file_id}")
def delete_existing_file(file_id: str):
    deleted = delete_file(file_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="File not found")

    return {"deleted": True, "id": file_id}
