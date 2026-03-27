from __future__ import annotations

import json
import logging
import os
import urllib.request

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, model_validator

logger = logging.getLogger("familiar")

app = FastAPI(title="Familiar API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BLAND_API_URL = "https://api.bland.ai/v1/calls"


# ── Models ──────────────────────────────────────────────

class CallRequest(BaseModel):
    phone_number: str | None = None
    patient_id: str | None = None  # future: look up patient profile
    task: str | None = None
    pathway_id: str | None = None
    persona_id: str | None = None
    voice: str = "mason"
    max_duration: int = 10
    record: bool = True
    metadata: dict | None = None


# ── Endpoints ───────────────────────────────────────────

@app.get("/api/hello")
def hello():
    return {"message": "Hello from Familiar"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/calls/trigger")
def trigger_call(req: CallRequest):
    api_key = os.environ.get("BLAND_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="BLAND_API_KEY not configured")

    base_url = os.environ.get("BASE_URL", "")
    webhook_url = f"{base_url}/api/calls/webhook" if base_url else None

    # Resolve phone: request > (future: patient profile) > env default
    phone = req.phone_number or os.environ.get("DEFAULT_PHONE_NUMBER")
    if not phone:
        raise HTTPException(status_code=400, detail="No phone number provided")

    # Resolve agent: request > (future: patient profile) > env default
    default_agent_id = os.environ.get("BLAND_AGENT_ID")
    has_explicit_agent = any([req.task, req.pathway_id, req.persona_id])

    if not has_explicit_agent and not default_agent_id:
        raise HTTPException(
            status_code=400,
            detail="Provide task, pathway_id, or persona_id (no default agent configured)",
        )

    payload = {
        "phone_number": phone,
        "voice": req.voice,
        "max_duration": req.max_duration,
        "record": req.record,
    }

    if req.task:
        payload["task"] = req.task
    if req.pathway_id:
        payload["pathway_id"] = req.pathway_id
    if req.persona_id:
        payload["persona_id"] = req.persona_id
    if not has_explicit_agent and default_agent_id:
        payload["persona_id"] = default_agent_id
    if req.metadata:
        payload["metadata"] = req.metadata
    if webhook_url:
        payload["webhook"] = webhook_url

    data = json.dumps(payload).encode()
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
    }

    request = urllib.request.Request(
        BLAND_API_URL, data=data, headers=headers, method="POST"
    )

    try:
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        logger.error("Bland AI error: %s %s", e.code, body)
        raise HTTPException(
            status_code=e.code,
            detail=f"Bland AI error: {body}",
        )

    return {
        "call_id": result.get("call_id"),
        "status": result.get("status", "queued"),
    }


@app.post("/api/calls/webhook")
async def call_webhook(request: Request):
    body = await request.json()

    call_id = body.get("call_id", "unknown")
    transcript = body.get("concatenated_transcript", "")
    recording_url = body.get("recording_url")
    call_length = body.get("call_length")
    status = body.get("status")
    metadata = body.get("metadata")

    logger.info(
        "Call completed | id=%s status=%s length=%s",
        call_id,
        status,
        call_length,
    )
    logger.info("Transcript | id=%s: %s", call_id, transcript)

    if recording_url:
        logger.info("Recording | id=%s: %s", call_id, recording_url)
    if metadata:
        logger.info("Metadata | id=%s: %s", call_id, json.dumps(metadata))

    return {"received": True}
