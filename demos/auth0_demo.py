"""
GrandmaCare — Auth0 Token Vault + FastAPI Demo
================================================
Implements the hero diagram:
  User ←→ AI Agent ←→ LLM
              ↕
         Auth0 (Token Vault)
              ↕
       Gmail / Calendar / Drive

Run: uvicorn auth0_grandmacare:app --reload --port 8000
Then visit: http://localhost:8000
"""

import os
import json
import secrets
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
import httpx

load_dotenv()

# ─────────────────────────────────────────────
# Configuration (from your .env file)
# ─────────────────────────────────────────────

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "your-tenant.us.auth0.com")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID", "your-client-id")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET", "your-client-secret")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "https://api.grandmacare.local")
AUTH0_CALLBACK_URL = "http://localhost:8000/auth/callback"
AUTH0_LOGOUT_URL = "http://localhost:8000"

app = FastAPI(title="GrandmaCare — Auth0 Demo")

# In-memory session store (use Redis in production)
sessions = {}


# ─────────────────────────────────────────────
# Auth0 Authentication Flow
# ─────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Landing page — shows login or dashboard based on session."""
    session_id = request.cookies.get("session_id")
    user = sessions.get(session_id) if session_id else None

    if user:
        return HTMLResponse(f"""
        <html>
        <head><title>GrandmaCare Dashboard</title>
        <style>
            body {{ font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }}
            .card {{ background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 16px 0; }}
            .badge {{ background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; }}
            h1 {{ color: #1f2937; }}
            a {{ color: #3b82f6; text-decoration: none; }}
            a:hover {{ text-decoration: underline; }}
            pre {{ background: #1f2937; color: #e5e7eb; padding: 16px; border-radius: 8px; overflow-x: auto; }}
        </style>
        </head>
        <body>
            <h1>🏠 GrandmaCare Dashboard</h1>
            <div class="card">
                <h3>👤 Logged in as: {user['name']}</h3>
                <p>Email: {user['email']}</p>
                <p>Auth0 User ID: <code>{user['sub']}</code></p>
                <p>Status: <span class="badge">Authenticated via Google</span></p>
            </div>

            <h2>🔐 Token Vault Actions</h2>
            <div class="card">
                <p>These endpoints use Auth0 Token Vault to exchange your Auth0 token for Google API tokens:</p>
                <ul>
                    <li><a href="/api/gmail">📧 Read Gmail</a> — Fetch recent emails about Grandma</li>
                    <li><a href="/api/calendar">📅 Read Calendar</a> — Check upcoming appointments</li>
                    <li><a href="/api/drive">📁 Read Drive</a> — Get medication schedule docs</li>
                    <li><a href="/api/agent-cycle">🤖 Run Full Agent Cycle</a> — Agent reads all APIs + reasons with LLM</li>
                </ul>
            </div>

            <h2>🔑 Your Auth0 Tokens (Debug)</h2>
            <div class="card">
                <p><strong>Auth0 Access Token</strong> (first 50 chars):</p>
                <pre>{user.get('access_token', 'N/A')[:50]}...</pre>
                <p><strong>Auth0 Refresh Token</strong> (present: {'✅ Yes' if user.get('refresh_token') else '❌ No'})</p>
                <p><em>The agent uses this refresh token to exchange for Google API tokens via Token Vault.</em></p>
            </div>

            <p><a href="/auth/logout">🚪 Logout</a></p>
        </body>
        </html>
        """)

    return HTMLResponse("""
    <html>
    <head><title>GrandmaCare</title>
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 100px auto; text-align: center; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px;
               border-radius: 8px; text-decoration: none; font-size: 16px; margin: 8px; }
        .btn:hover { background: #2563eb; }
        .btn-google { background: #ea4335; }
        .btn-google:hover { background: #dc2626; }
    </style>
    </head>
    <body>
        <h1>🏠 GrandmaCare</h1>
        <p>AI-powered elder care — secured by Auth0</p>
        <p>Sign in with your Google account to connect Gmail, Calendar, and Drive.</p>
        <a class="btn btn-google" href="/auth/login">🔐 Sign in with Google (Auth0)</a>
        <br><br>
        <p style="color: #6b7280; font-size: 13px;">
            Auth0 Token Vault securely stores your Google tokens.<br>
            The agent never sees your Google password or refresh token.
        </p>
    </body>
    </html>
    """)


@app.get("/auth/login")
async def login():
    """
    Redirect to Auth0 Universal Login.

    This is the entry point of the diagram:
    User → Auth0 (with Google connection) → Token Exchange → Token Vault
    """
    params = {
        "response_type": "code",
        "client_id": AUTH0_CLIENT_ID,
        "redirect_uri": AUTH0_CALLBACK_URL,
        "scope": "openid profile email offline_access",
        # Force Google connection (skip Auth0 login page)
        "connection": "google-oauth2",
        # Request offline_access for refresh token (needed for Token Vault)
        "audience": AUTH0_AUDIENCE,
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"https://{AUTH0_DOMAIN}/authorize?{query}")


@app.get("/auth/callback")
async def callback(request: Request):
    """
    Auth0 redirects here after user authenticates.
    We exchange the authorization code for tokens.

    At this point, Auth0 has already:
    1. Authenticated the user via Google
    2. Stored Google's access + refresh tokens in Token Vault
    3. Given us Auth0 tokens (access + refresh)
    """
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(400, "Missing authorization code")

    # Exchange auth code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            f"https://{AUTH0_DOMAIN}/oauth/token",
            json={
                "grant_type": "authorization_code",
                "client_id": AUTH0_CLIENT_ID,
                "client_secret": AUTH0_CLIENT_SECRET,
                "code": code,
                "redirect_uri": AUTH0_CALLBACK_URL,
            },
        )

    if token_response.status_code != 200:
        return JSONResponse(
            {"error": "Token exchange failed", "detail": token_response.json()},
            status_code=400,
        )

    tokens = token_response.json()

    # Get user profile
    async with httpx.AsyncClient() as client:
        userinfo = await client.get(
            f"https://{AUTH0_DOMAIN}/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )

    user_data = userinfo.json()
    user_data["access_token"] = tokens.get("access_token")
    user_data["refresh_token"] = tokens.get("refresh_token")
    user_data["id_token"] = tokens.get("id_token")

    # Create session
    session_id = secrets.token_hex(32)
    sessions[session_id] = user_data

    response = RedirectResponse("/")
    response.set_cookie("session_id", session_id, httponly=True)
    return response


@app.get("/auth/logout")
async def logout(request: Request):
    """Clear session and redirect to Auth0 logout."""
    session_id = request.cookies.get("session_id")
    if session_id:
        sessions.pop(session_id, None)

    response = RedirectResponse(
        f"https://{AUTH0_DOMAIN}/v2/logout?"
        f"client_id={AUTH0_CLIENT_ID}&returnTo={AUTH0_LOGOUT_URL}"
    )
    response.delete_cookie("session_id")
    return response


# ─────────────────────────────────────────────
# Helper: Get current user from session
# ─────────────────────────────────────────────

async def get_current_user(request: Request) -> dict:
    session_id = request.cookies.get("session_id")
    user = sessions.get(session_id) if session_id else None
    if not user:
        raise HTTPException(401, "Not authenticated. Visit / to log in.")
    return user


# ─────────────────────────────────────────────
# Token Vault: Exchange Auth0 token → Google token
# ─────────────────────────────────────────────

async def get_google_token_from_vault(
    user: dict,
    scopes: list[str],
    connection: str = "google-oauth2",
) -> str:
    """
    THIS IS THE CORE TOKEN VAULT OPERATION.

    Matches the diagram: Auth0 Token Vault → Token Exchange → Google API token

    Uses RFC 8693 Token Exchange:
    - We send our Auth0 refresh token
    - Auth0 returns a fresh, scoped Google access token
    - We NEVER see Google's refresh token

    API: POST https://{domain}/oauth/token
    Grant type: urn:ietf:params:oauth:grant-type:token-exchange
    """
    access_token = user.get("access_token")
    if not access_token:
        raise HTTPException(
            400,
            "No access token available. Re-login."
        )

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://{AUTH0_DOMAIN}/oauth/token",
            json={
                "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
                "subject_token": access_token,
                "subject_token_type": "urn:ietf:params:oauth:token-type:access_token",
                "requested_token_type": "urn:auth0:params:oauth:token-type:connection",
                "client_id": AUTH0_CLIENT_ID,
                "client_secret": AUTH0_CLIENT_SECRET,
                "connection": connection,
                "scope": " ".join(scopes),
            },
        )

    if response.status_code != 200:
        error_detail = response.json()
        raise HTTPException(
            400,
            f"Token Vault exchange failed: {error_detail.get('error_description', error_detail)}"
        )

    vault_response = response.json()
    return vault_response["access_token"]


# ─────────────────────────────────────────────
# API Endpoints: Agent reads Google APIs
# ─────────────────────────────────────────────

@app.get("/api/gmail")
async def read_gmail(user: dict = Depends(get_current_user)):
    """
    Agent reads Gmail using token from Auth0 Token Vault.

    Flow: Auth0 refresh token → Token Vault exchange → Google access token → Gmail API
    """
    try:
        google_token = await get_google_token_from_vault(
            user,
            scopes=["https://www.googleapis.com/auth/gmail.readonly"],
        )
    except HTTPException as e:
        return JSONResponse({
            "status": "token_vault_exchange_failed",
            "error": str(e.detail),
            "help": "Make sure Token Vault is enabled on your Google connection in Auth0 Dashboard. "
                    "Go to: Authentication → Social → google-oauth2 → Advanced → Enable Token Vault.",
        }, status_code=400)

    # Call Gmail API with the token from Token Vault
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            headers={"Authorization": f"Bearer {google_token}"},
            params={"maxResults": 5, "q": "is:inbox"},
        )

    if response.status_code == 200:
        messages = response.json().get("messages", [])
        # Fetch details for each message
        email_summaries = []
        for msg in messages[:3]:
            detail = await _get_email_detail(google_token, msg["id"])
            email_summaries.append(detail)

        return {
            "status": "success",
            "source": "Gmail API via Auth0 Token Vault",
            "token_method": "RFC 8693 Token Exchange",
            "emails_found": len(messages),
            "emails": email_summaries,
        }
    else:
        return {
            "status": "gmail_api_error",
            "code": response.status_code,
            "detail": response.json(),
        }


async def _get_email_detail(token: str, message_id: str) -> dict:
    """Fetch a single email's details."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}",
            headers={"Authorization": f"Bearer {token}"},
            params={"format": "metadata", "metadataHeaders": ["From", "Subject", "Date"]},
        )
    if response.status_code == 200:
        data = response.json()
        headers = {h["name"]: h["value"] for h in data.get("payload", {}).get("headers", [])}
        return {
            "id": message_id,
            "from": headers.get("From", "Unknown"),
            "subject": headers.get("Subject", "No subject"),
            "date": headers.get("Date", "Unknown"),
            "snippet": data.get("snippet", ""),
        }
    return {"id": message_id, "error": "Could not fetch details"}


@app.get("/api/calendar")
async def read_calendar(user: dict = Depends(get_current_user)):
    """
    Agent reads Google Calendar using token from Auth0 Token Vault.
    """
    try:
        google_token = await get_google_token_from_vault(
            user,
            scopes=["https://www.googleapis.com/auth/calendar.readonly"],
        )
    except HTTPException as e:
        return JSONResponse({
            "status": "token_vault_exchange_failed",
            "error": str(e.detail),
        }, status_code=400)

    now = datetime.utcnow().isoformat() + "Z"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            headers={"Authorization": f"Bearer {google_token}"},
            params={
                "timeMin": now,
                "maxResults": 10,
                "singleEvents": True,
                "orderBy": "startTime",
            },
        )

    if response.status_code == 200:
        events = response.json().get("items", [])
        return {
            "status": "success",
            "source": "Google Calendar API via Auth0 Token Vault",
            "events_found": len(events),
            "events": [
                {
                    "summary": e.get("summary", "No title"),
                    "start": e.get("start", {}).get("dateTime", e.get("start", {}).get("date")),
                    "end": e.get("end", {}).get("dateTime", e.get("end", {}).get("date")),
                    "location": e.get("location"),
                }
                for e in events
            ],
        }
    else:
        return {"status": "calendar_api_error", "code": response.status_code, "detail": response.json()}


@app.get("/api/drive")
async def read_drive(user: dict = Depends(get_current_user)):
    """
    Agent reads Google Drive using token from Auth0 Token Vault.
    """
    try:
        google_token = await get_google_token_from_vault(
            user,
            scopes=["https://www.googleapis.com/auth/drive.readonly"],
        )
    except HTTPException as e:
        return JSONResponse({
            "status": "token_vault_exchange_failed",
            "error": str(e.detail),
        }, status_code=400)

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/drive/v3/files",
            headers={"Authorization": f"Bearer {google_token}"},
            params={"pageSize": 10, "orderBy": "modifiedTime desc"},
        )

    if response.status_code == 200:
        files = response.json().get("files", [])
        return {
            "status": "success",
            "source": "Google Drive API via Auth0 Token Vault",
            "files_found": len(files),
            "files": [
                {
                    "name": f.get("name"),
                    "mimeType": f.get("mimeType"),
                    "id": f.get("id"),
                }
                for f in files
            ],
        }
    else:
        return {"status": "drive_api_error", "code": response.status_code, "detail": response.json()}


@app.get("/api/agent-cycle")
async def run_agent_cycle(user: dict = Depends(get_current_user)):
    """
    Full agent cycle: reads all Google APIs, then reasons.

    This is the complete flow from the diagram:
    1. User already authenticated (session exists)
    2. Token Vault → Gmail token → read emails
    3. Token Vault → Calendar token → read events
    4. Token Vault → Drive token → read files
    5. LLM analyzes everything
    6. Agent takes autonomous action
    """
    results = {
        "user": user.get("name"),
        "timestamp": datetime.utcnow().isoformat(),
        "steps": [],
    }

    # Step 1: Gmail
    try:
        gmail_token = await get_google_token_from_vault(
            user, scopes=["https://www.googleapis.com/auth/gmail.readonly"]
        )
        results["steps"].append({
            "step": 1,
            "action": "Token Vault → Gmail token",
            "status": "success",
            "token_preview": gmail_token[:20] + "...",
        })
    except Exception as e:
        results["steps"].append({
            "step": 1,
            "action": "Token Vault → Gmail token",
            "status": "failed",
            "error": str(e),
        })
        gmail_token = None

    # Step 2: Calendar
    try:
        cal_token = await get_google_token_from_vault(
            user, scopes=["https://www.googleapis.com/auth/calendar.readonly"]
        )
        results["steps"].append({
            "step": 2,
            "action": "Token Vault → Calendar token",
            "status": "success",
            "token_preview": cal_token[:20] + "...",
        })
    except Exception as e:
        results["steps"].append({
            "step": 2,
            "action": "Token Vault → Calendar token",
            "status": "failed",
            "error": str(e),
        })
        cal_token = None

    # Step 3: Drive
    try:
        drive_token = await get_google_token_from_vault(
            user, scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
        results["steps"].append({
            "step": 3,
            "action": "Token Vault → Drive token",
            "status": "success",
            "token_preview": drive_token[:20] + "...",
        })
    except Exception as e:
        results["steps"].append({
            "step": 3,
            "action": "Token Vault → Drive token",
            "status": "failed",
            "error": str(e),
        })
        drive_token = None

    # Step 4: Agent reasoning (would go to Bedrock/OpenAI in production)
    results["steps"].append({
        "step": 4,
        "action": "LLM Analysis",
        "status": "ready",
        "note": "In production, all fetched data is sent to AWS Bedrock for reasoning",
    })

    results["security_summary"] = {
        "auth_method": "Auth0 Universal Login (Google OAuth 2.0)",
        "token_management": "Auth0 Token Vault (RFC 8693 exchange)",
        "google_refresh_token_stored_by": "Auth0 (not our app)",
        "google_tokens_are": "short-lived, scoped, auto-refreshed",
        "user_consented_once": True,
    }

    return results


# ─────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("\n🏠 GrandmaCare Auth0 Demo")
    print(f"   Auth0 Domain: {AUTH0_DOMAIN}")
    print(f"   Client ID:    {AUTH0_CLIENT_ID[:8]}...")
    print(f"   Audience:     {AUTH0_AUDIENCE}")
    print(f"\n   Visit: http://localhost:8000\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
