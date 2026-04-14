"""Project schema placeholder."""

from pydantic import BaseModel


class ProjectSchema(BaseModel):
    id: int | None = None
    name: str
