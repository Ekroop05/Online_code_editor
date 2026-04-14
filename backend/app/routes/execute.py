from fastapi import APIRouter
from app.schemas.code_schema import CodeRequest
from app.services.execution_service import execute_code

router = APIRouter()

@router.post("/execute")
def run_code(req: CodeRequest):
    result = execute_code(req.language, req.code)
    return result