from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from app.services.collaboration_service import connection_manager
from app.services.file_service import get_file_by_id


router = APIRouter()


@router.websocket("/ws/{file_id}")
async def collaborate_on_file(websocket: WebSocket, file_id: str):
    file_document = get_file_by_id(file_id)
    if file_document is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await connection_manager.connect(file_id, websocket)

    await connection_manager.send_personal_message(
        websocket,
        {
            "type": "sync",
            "fileId": file_id,
            "content": file_document["content"],
        },
    )

    try:
        while True:
            payload = await websocket.receive_json()
            if payload.get("type") != "edit":
                continue

            content = payload.get("content", "")
            sender_id = payload.get("senderId")

            await connection_manager.broadcast(
                file_id,
                {
                    "type": "edit",
                    "fileId": file_id,
                    "content": content,
                    "senderId": sender_id,
                },
                sender=websocket,
            )
    except WebSocketDisconnect:
        connection_manager.disconnect(file_id, websocket)
    except Exception:
        connection_manager.disconnect(file_id, websocket)
        raise
