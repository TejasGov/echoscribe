from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from api.schemas import SoapNote, TranscriptTurn

app = FastAPI(
    title="EchoScribe Clinical AI Engine",
    version="0.1.0",
    description="Ambient clinical speech to structured FHIR/SOAP EHR notes"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "online", "service": "EchoScribe"}

@app.websocket("/ws/ambient-audio")
async def ambient_audio_stream(websocket: WebSocket):
    """
    WebSocket endpoint for ambient encounter audio streaming and live SOAP draft updates.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            # Simulated dual-stream ack
            await websocket.send_json({
                "type": "ack",
                "received": payload.get("type", "audio_frame")
            })
    except WebSocketDisconnect:
        pass
