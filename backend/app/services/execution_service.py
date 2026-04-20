import os
import re
import shutil
import subprocess
import uuid
from pathlib import Path

from app.core.config import settings

TEMP_DIR = settings.temp_dir
BACKEND_DIR = Path(__file__).resolve().parents[2]
BUNDLED_JAVA_HOME = BACKEND_DIR / ".render" / "java"

# Ensure temp folder exists
TEMP_DIR.mkdir(parents=True, exist_ok=True)

LANGUAGE_ALIASES = {
    "python": "python",
    "py": "python",
    "javascript": "javascript",
    "js": "javascript",
    "node": "javascript",
    "c++": "cpp",
    "cpp": "cpp",
    "java": "java",
    "bash": "bash",
    "sh": "bash",
    "shell": "bash",
}


def _run_subprocess(command: list[str], timeout: int = 5, cwd: str | None = None):
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd
        )
        return {
            "output": result.stdout,
            "error": result.stderr
        }
    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": "Execution timed out"
        }


def _cleanup_paths(*paths: str):
    for path in paths:
        if path and os.path.exists(path) and os.path.isfile(path):
            os.remove(path)


def _cleanup_directory(path: Path):
    if path.exists() and path.is_dir():
        shutil.rmtree(path, ignore_errors=True)


def _resolve_executable(command_name: str, java_home: Path | None = None) -> str | None:
    search_roots = []

    if java_home:
        search_roots.append(java_home)

    env_java_home = os.getenv("JAVA_HOME")
    if env_java_home:
        search_roots.append(Path(env_java_home))

    search_roots.append(BUNDLED_JAVA_HOME)

    for root in search_roots:
        candidate = root / "bin" / command_name
        if candidate.exists():
            return str(candidate)

    return shutil.which(command_name)


def execute_python(code: str):
    file_id = str(uuid.uuid4())
    file_path = TEMP_DIR / f"{file_id}.py"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        python_command = shutil.which("python") or shutil.which("py")
        if not python_command:
            return {"output": "", "error": "Python runtime is not available on this machine."}

        return _run_subprocess([python_command, str(file_path)])
    finally:
        _cleanup_paths(str(file_path))


def execute_javascript(code: str):
    node_command = shutil.which("node")
    if not node_command:
        return {"output": "", "error": "Node.js runtime is not available on this machine."}

    file_id = str(uuid.uuid4())
    file_path = TEMP_DIR / f"{file_id}.js"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        return _run_subprocess([node_command, str(file_path)])
    finally:
        _cleanup_paths(str(file_path))


def execute_cpp(code: str):
    gpp_command = shutil.which("g++")
    if not gpp_command:
        return {"output": "", "error": "g++ compiler is not available on this machine."}

    file_id = str(uuid.uuid4())
    source_path = TEMP_DIR / f"{file_id}.cpp"
    binary_path = TEMP_DIR / f"{file_id}.exe"

    with open(source_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        compile_result = _run_subprocess([gpp_command, str(source_path), "-o", str(binary_path)], timeout=10)
        if compile_result["error"]:
            return compile_result

        return _run_subprocess([str(binary_path)], timeout=5)
    finally:
        _cleanup_paths(str(source_path), str(binary_path))


def _detect_java_class_name(code: str) -> str:
    public_match = re.search(r"public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)", code)
    if public_match:
        return public_match.group(1)

    class_match = re.search(r"class\s+([A-Za-z_][A-Za-z0-9_]*)", code)
    if class_match:
        return class_match.group(1)

    return "Main"


def execute_java(code: str):
    java_home = BUNDLED_JAVA_HOME if BUNDLED_JAVA_HOME.exists() else None
    javac_command = _resolve_executable("javac", java_home=java_home)
    java_command = _resolve_executable("java", java_home=java_home)
    if not javac_command or not java_command:
        return {"output": "", "error": "Java runtime/compiler is not available on this machine."}

    workspace_dir = TEMP_DIR / f"java-{uuid.uuid4()}"
    workspace_dir.mkdir(parents=True, exist_ok=True)

    class_name = _detect_java_class_name(code)
    source_path = workspace_dir / f"{class_name}.java"

    with open(source_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        compile_result = _run_subprocess([javac_command, source_path.name], timeout=10, cwd=str(workspace_dir))
        if compile_result["error"]:
            return compile_result

        return _run_subprocess([java_command, "-cp", str(workspace_dir), class_name], timeout=5)
    finally:
        _cleanup_directory(workspace_dir)


def execute_bash(code: str):
    bash_path = shutil.which("bash")
    if not bash_path:
        return {
            "output": "",
            "error": "Bash is not available on this machine. Install WSL or Git Bash to run shell files."
        }

    file_id = str(uuid.uuid4())
    file_path = TEMP_DIR / f"{file_id}.sh"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        return _run_subprocess([bash_path, str(file_path)])
    finally:
        _cleanup_paths(str(file_path))


def execute_code(language: str, code: str):
    normalized_language = LANGUAGE_ALIASES.get(language.lower(), language.lower())

    if normalized_language == "python":
        return execute_python(code)

    if normalized_language == "javascript":
        return execute_javascript(code)

    if normalized_language == "cpp":
        return execute_cpp(code)

    if normalized_language == "java":
        return execute_java(code)

    if normalized_language == "bash":
        return execute_bash(code)

    return {
        "output": "",
        "error": "Language not supported yet"
    }
