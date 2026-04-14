from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.chat_service import chat_connection_manager


router = APIRouter()


@router.websocket("/ws/chat")
async def chat_socket(websocket: WebSocket):
    await chat_connection_manager.connect(websocket)

    try:
        while True:
            payload = await websocket.receive_json()
            if payload.get("type") != "chat":
                continue

            await chat_connection_manager.broadcast(
                {
                    "type": "chat",
                    "author": payload.get("author", "Guest"),
                    "text": payload.get("text", ""),
                }
            )
    except WebSocketDisconnect:
        chat_connection_manager.disconnect(websocket)
    except Exception:
        chat_connection_manager.disconnect(websocket)
        raise
