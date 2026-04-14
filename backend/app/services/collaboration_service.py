from collections import defaultdict
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, file_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections[file_id].append(websocket)

    def disconnect(self, file_id: str, websocket: WebSocket) -> None:
        room = self.active_connections.get(file_id)
        if not room:
            return

        if websocket in room:
            room.remove(websocket)

        if not room:
            self.active_connections.pop(file_id, None)

    async def send_personal_message(self, websocket: WebSocket, payload: dict[str, Any]) -> None:
        await websocket.send_json(payload)

    async def broadcast(self, file_id: str, payload: dict[str, Any], sender: WebSocket | None = None) -> None:
        for connection in list(self.active_connections.get(file_id, [])):
            if sender is not None and connection is sender:
                continue
            await connection.send_json(payload)


connection_manager = ConnectionManager()
