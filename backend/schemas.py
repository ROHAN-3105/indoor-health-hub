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
