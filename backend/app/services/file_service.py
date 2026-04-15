import uuid
from typing import Any, List

from app.db.session import get_files_collection


def _infer_language(filename: str) -> str:
    extension_map = {
        ".py": "python",
        ".js": "javascript",
        ".ts": "typescript",
        ".jsx": "javascript",
        ".tsx": "typescript",
        ".cpp": "cpp",
        ".cc": "cpp",
        ".cxx": "cpp",
        ".java": "java",
        ".sh": "bash",
        ".bash": "bash",
        ".json": "json",
        ".html": "html",
        ".css": "css",
    }

    for extension, language in extension_map.items():
        if filename.lower().endswith(extension):
            return language

    return "text"


def _serialize_file(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": document["id"],
        "name": document["name"],
        "language": document.get("language", _infer_language(document["name"])),
        "content": document.get("content", ""),
        "notes": document.get("notes", ""),
    }


def get_all_files() -> List[dict[str, Any]]:
    collection = get_files_collection()
    documents = collection.find({}, {"_id": 0})
    return [_serialize_file(doc) for doc in documents if doc.get("name") not in {"helper.py", "runner.py"}]


def create_file(
    name: str,
    language: str | None = None,
    content: str = "",
    notes: str = "",
) -> dict[str, Any]:
    collection = get_files_collection()

    file_id = str(uuid.uuid4())

    new_file = {
        "id": file_id,
        "name": name,
        "language": language or _infer_language(name),
        "content": content,
        "notes": notes,
    }

    collection.insert_one(new_file)
    return _serialize_file(new_file)


def get_file_by_id(file_id: str) -> dict[str, Any] | None:
    collection = get_files_collection()
    document = collection.find_one({"id": file_id}, {"_id": 0})

    if document is None:
        return None

    return _serialize_file(document)


def update_file(file_id: str, content: str) -> dict[str, Any] | None:
    collection = get_files_collection()

    result = collection.update_one(
        {"id": file_id},
        {"$set": {"content": content}}
    )

    if result.matched_count == 0:
        return None

    updated_doc = collection.find_one({"id": file_id}, {"_id": 0})
    return _serialize_file(updated_doc)


def update_file_notes(file_id: str, notes: str) -> dict[str, Any] | None:
    collection = get_files_collection()

    result = collection.update_one(
        {"id": file_id},
        {"$set": {"notes": notes}},
    )

    if result.matched_count == 0:
        return None

    updated_doc = collection.find_one({"id": file_id}, {"_id": 0})
    return _serialize_file(updated_doc)


def delete_file(file_id: str) -> bool:
    collection = get_files_collection()
    result = collection.delete_one({"id": file_id})
    return result.deleted_count > 0


def remove_legacy_seed_files() -> int:
    collection = get_files_collection()
    result = collection.delete_many({"name": {"$in": ["helper.py", "runner.py"]}})
    return result.deleted_count
