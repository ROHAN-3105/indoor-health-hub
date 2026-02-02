from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SensorData(BaseModel):
    device_id: str
    location: Optional[str] = None
    timestamp: Optional[datetime] = None

    temperature: float
    humidity: float
    pm25: float
    pm10: float
    noise: float
    light: float

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

