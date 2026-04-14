"""User schema placeholder."""

from pydantic import BaseModel


class UserSchema(BaseModel):
    id: int | None = None
    username: str
