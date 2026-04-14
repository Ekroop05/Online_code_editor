import os
import re
import shutil
import subprocess
import uuid

TEMP_DIR = "temp"

# Ensure temp folder exists
os.makedirs(TEMP_DIR, exist_ok=True)

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


def execute_python(code: str):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_DIR, f"{file_id}.py")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        return _run_subprocess(["py", file_path])
    finally:
        _cleanup_paths(file_path)


def execute_javascript(code: str):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_DIR, f"{file_id}.js")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        return _run_subprocess(["node", file_path])
    finally:
        _cleanup_paths(file_path)


def execute_cpp(code: str):
    file_id = str(uuid.uuid4())
    source_path = os.path.join(TEMP_DIR, f"{file_id}.cpp")
    binary_path = os.path.join(TEMP_DIR, f"{file_id}.exe")

    with open(source_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        compile_result = _run_subprocess(["g++", source_path, "-o", binary_path], timeout=10)
        if compile_result["error"]:
            return compile_result

        return _run_subprocess([binary_path], timeout=5)
    finally:
        _cleanup_paths(source_path, binary_path)


def _detect_java_class_name(code: str) -> str:
    public_match = re.search(r"public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)", code)
    if public_match:
        return public_match.group(1)

    class_match = re.search(r"class\s+([A-Za-z_][A-Za-z0-9_]*)", code)
    if class_match:
        return class_match.group(1)

    return "Main"


def execute_java(code: str):
    class_name = _detect_java_class_name(code)
    source_path = os.path.join(TEMP_DIR, f"{class_name}.java")
    class_path = os.path.join(TEMP_DIR, f"{class_name}.class")

    with open(source_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        compile_result = _run_subprocess(["javac", os.path.basename(source_path)], timeout=10, cwd=TEMP_DIR)
        if compile_result["error"]:
            return compile_result

        return _run_subprocess(["java", "-cp", TEMP_DIR, class_name], timeout=5)
    finally:
        _cleanup_paths(source_path, class_path)


def execute_bash(code: str):
    bash_path = shutil.which("bash")
    if not bash_path:
        return {
            "output": "",
            "error": "Bash is not available on this machine. Install WSL or Git Bash to run shell files."
        }

    file_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_DIR, f"{file_id}.sh")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        return _run_subprocess([bash_path, file_path])
    finally:
        _cleanup_paths(file_path)


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
