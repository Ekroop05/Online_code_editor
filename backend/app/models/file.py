from pydantic import BaseModel
from typing import Optional


class FileCreate(BaseModel):
    name: str
    language: Optional[str] = None
    content: Optional[str] = ""


class FileUpdate(BaseModel):
    content: str


class FileResponse(BaseModel):
    id: str
    name: str
    language: str
    content: str
