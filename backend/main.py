from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Dict, List

from recommendation_engine import generate_recommendations
from aqi_engine import calculate_pm_aqi
from alerts_engine import generate_alerts
from health_engine import calculate_health_score
import auth
from db import create_user, get_user_by_username, init_db
from schemas import UserCreate, Token, UserResponse

# ---------------------------
# APP SETUP
# ---------------------------

app = FastAPI(title="Monacos Indoor Health API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# IN-MEMORY STORAGE
# ---------------------------

DEVICE_STATE: Dict[str, dict] = {}
DEVICE_HISTORY: Dict[str, List[dict]] = {}
DEVICE_ALERTS: Dict[str, List[dict]] = {}

MAX_HISTORY = 60          # last 60 readings
ONLINE_TIMEOUT = 30      # seconds

# ---------------------------
# AUTHENTICATION
# ---------------------------

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/auth/signup", response_model=UserResponse)
def signup(user: UserCreate):
    try:
        existing_user = get_user_by_username(user.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        hashed_password = auth.get_password_hash(user.password)
        user_id = create_user(user.username, hashed_password)
        
        if not user_id:
            # Check if it was collision that wasn't caught?
            # Or database error
            raise HTTPException(status_code=500, detail="Failed to create user (DB Error)")
            
        return {
            "id": user_id,
            "username": user.username,
            "created_at": datetime.utcnow()
        }
    except Exception as e:
        print(f"Signup Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login", response_model=Token)
def login(user: UserCreate):
    db_user = get_user_by_username(user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not auth.verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    username = payload.get("sub")
    user = get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.get("/auth/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    # Convert sqlite row to dict
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"] if "email" in current_user.keys() else None,
        "full_name": current_user["full_name"] if "full_name" in current_user.keys() else None,
        "created_at": current_user["created_at"]
    }

class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None

@app.put("/auth/me")
def update_me(payload: UserUpdate, current_user: dict = Depends(get_current_user)):
    from db import update_user_profile
    update_user_profile(current_user["username"], payload.email, payload.full_name)
    return {"status": "updated", "email": payload.email, "full_name": payload.full_name}

# ---------------------------
# DATA MODEL
# ---------------------------

class SensorPayload(BaseModel):
    device_id: str

    temperature: float
    humidity: float

    pm25: float
    pm10: float

    noise: float
    light: float

    timestamp: datetime | None = None
    
    # Arduino specific/Optional
    pressure: float | None = None
    gas: float | None = None

# ---------------------------
# INGEST SENSOR DATA
# ---------------------------

@app.post("/api/ingest")
def ingest(payload: SensorPayload):
    from db import ensure_device_exists
    
    timestamp = payload.timestamp or datetime.utcnow()

    data = payload.dict()
    data["timestamp"] = timestamp

    # Ensure device is registered in DB
    ensure_device_exists(payload.device_id)

    # latest snapshot
    print(f"DEBUG: Ingesting for {payload.device_id}. Data: {data}")
    DEVICE_STATE[payload.device_id] = data
    print(f"DEBUG: Current DEVICE_STATE keys: {list(DEVICE_STATE.keys())}")

    # history buffer
    DEVICE_HISTORY.setdefault(payload.device_id, []).append(data)
    DEVICE_HISTORY[payload.device_id] = DEVICE_HISTORY[payload.device_id][-MAX_HISTORY:]

    return {
        "status": "ingested",
        "device_id": payload.device_id,
        "timestamp": timestamp,
    }

@app.post("/data")
def ingest_arduino(payload: SensorPayload):
    # Compatibility route for Arduino which uses /data
    return ingest(payload)

# ---------------------------
# GET LATEST DATA
# ---------------------------

@app.get("/api/latest/{device_id}")
def get_latest(device_id: str):
    print(f"DEBUG: Request for {device_id}. Keys in memory: {list(DEVICE_STATE.keys())}")
    
    if device_id in DEVICE_STATE:
        return DEVICE_STATE[device_id]

    print(f"DEBUG: Memory miss for {device_id}. Checking DB...")
    from db import get_db
    conn = get_db()
    cursor = conn.cursor()
    
    # Get latest reading from DB
    cursor.execute("""
        SELECT * FROM sensor_readings 
        WHERE device_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
    """, (device_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        data = dict(row)
        # Type conversion if needed (sqlite returns basic types)
        # Ensure it matches SensorPayload structure roughly for frontend
        return data
        
    raise HTTPException(404, "Device offline or no recent data")

# ---------------------------
# HISTORY
# ---------------------------

@app.get("/api/history/{device_id}")
def get_history(device_id: str):
    print(f"DEBUG: Fetching history for {device_id} from DB")
    from db import get_db
    conn = get_db()
    cursor = conn.cursor()
    
    # Get last 7 days of data
    # We generated data with timestamp being stored. 
    # SQLite stores DATETIME as strings usually.
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    cursor.execute("""
        SELECT * FROM sensor_readings 
        WHERE device_id = ? AND timestamp >= ? 
        ORDER BY timestamp ASC
    """, (device_id, seven_days_ago))
    
    rows = cursor.fetchall()
    conn.close()
    
    results = [dict(row) for row in rows]
    print(f"DEBUG: Found {len(results)} history records for {device_id}")
    return results

# ---------------------------
# HEALTH SCORE
# ---------------------------

@app.get("/api/health-score/{device_id}")
def get_health_score(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    return calculate_health_score(DEVICE_STATE[device_id])

# ---------------------------
# ALERTS
# ---------------------------

@app.get("/api/alerts/{device_id}")
def get_alerts(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    new_alerts = generate_alerts(DEVICE_STATE[device_id])

    DEVICE_ALERTS.setdefault(device_id, [])

    # Deduplicate by title: Remove old alerts that match the title of new alerts
    # This ensures we only keep the LATEST alert of a specific type (e.g., "High PM2.5 Pollution")
    for new_alert in new_alerts:
        # Remove existing alerts with the same title
        DEVICE_ALERTS[device_id] = [
            a for a in DEVICE_ALERTS[device_id] 
            if a["title"] != new_alert["title"]
        ]
        # Append the new one
        DEVICE_ALERTS[device_id].append(new_alert)

    # Optional: Keep only last 20 alerts total to prevent unbounded growth if many types exist
    DEVICE_ALERTS[device_id] = DEVICE_ALERTS[device_id][-20:]

    return DEVICE_ALERTS[device_id]

# ---------------------------
# LIST DEVICES
# ---------------------------

@app.get("/api/devices")
def list_devices():
    from db import get_all_devices
    
    now = datetime.utcnow()
    devices = []
    
    # helper for safe float conversion
    def safe_get(d, key):
        return d.get(key, 0.0)

    # Get all persisted devices
    db_devices = get_all_devices()
    
    for db_dev in db_devices:
        d_id = db_dev["device_id"]
        
        # Check if we have live state for this device
        if d_id in DEVICE_STATE:
            data = DEVICE_STATE[d_id]
            last_seen = data["timestamp"]
            
            # Normalize to naive UTC if aware (assuming input is UTC)
            if last_seen and last_seen.tzinfo:
                last_seen = last_seen.replace(tzinfo=None)

            online = (now - last_seen) < timedelta(seconds=ONLINE_TIMEOUT)
            
            devices.append({
                "device_id": d_id,
                "last_seen": last_seen,
                "status": "online" if online else "offline",
                "temperature": safe_get(data, "temperature"),
                "pm25": safe_get(data, "pm25"),
                "noise": safe_get(data, "noise"),
                "light": safe_get(data, "light"),
            })
        else:
            # Device exists in DB but no in-memory state (restarted server)
            # Mark as offline with last_seen from DB
            # DB last_seen might be a string or datetime object depending on SQLite adapter
            ls = db_dev["last_seen"]
            if isinstance(ls, str):
                try:
                    ls = datetime.fromisoformat(ls)
                except:
                    pass
            
            if isinstance(ls, datetime) and ls.tzinfo:
                ls = ls.replace(tzinfo=None)
            
            devices.append({
                "device_id": d_id,
                "last_seen": ls,
                "status": "offline",
                "temperature": 0.0, # default/unknown
                "pm25": 0.0,
                "noise": 0.0,
                "light": 0.0,
            })

    return devices


class DeviceCreate(BaseModel):
    device_id: str

@app.post("/api/devices")
def add_device(payload: DeviceCreate):
    from db import ensure_device_exists
    ensure_device_exists(payload.device_id)
    return {"status": "created", "device_id": payload.device_id}


# ---------------------------
# RECOMMENDATIONS
# ---------------------------

@app.get("/api/recommendations/{device_id}")
def recommendations(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    return generate_recommendations(DEVICE_STATE[device_id])

# ---------------------------
# AQI
# ---------------------------

@app.get("/api/aqi/{device_id}")
def get_aqi(device_id: str):
    if device_id not in DEVICE_STATE:
        raise HTTPException(404, "Device offline")

    data = DEVICE_STATE[device_id]

    return calculate_pm_aqi(data["pm25"], data["pm10"])

# ---------------------------
# AGENT / CHAT
# ---------------------------

class ChatRequest(BaseModel):
    message: str
    device_id: str

@app.post("/api/chat")
def chat_agent(payload: ChatRequest):
    from agent_engine import run_agent
    try:
        response = run_agent(payload.message, payload.device_id)
        return {"response": response, "actions_taken": []}
    except Exception as e:
        error_msg = str(e)
        print(f"Agent Error: {error_msg}")
        
        # Handle quota exceeded
        if ("quota" in error_msg.lower() or "resource_exhausted" in error_msg.lower() or 
            "429" in error_msg or "rate limit" in error_msg.lower()):
            
            # Extract wait time if available in error message (simplified)
            retry_after = "60" 
            
            # USER REQUEST: "Show me how to increase the limit for local development"
            # NOTE: Since the limit is from Google Gemini (Upstream), you cannot increase it locally 
            # without upgrading your Google Cloud plan.
            # 
            # If you wanted to add LOCAL rate limiting (e.g., to prevent spam),
            # you would use 'slowapi' here. Example:
            # @limiter.limit("5/minute")
            # def chat_agent...
            
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "AI Provider Quota Exceeded. Please wait before retrying.",
                    "source": "Google Gemini API (Free Tier)",
                    "solution": "Retry after the specified duration."
                },
                headers={"Retry-After": retry_after}
            )
        
        # Handle other errors with helpful message
        raise HTTPException(status_code=500, detail=f"Chatbot temporarily unavailable: {error_msg[:100]}")

