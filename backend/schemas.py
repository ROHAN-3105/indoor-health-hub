from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SensorData(BaseModel):
    device_id: str
    location: Optional[str]
    timestamp: datetime

    temperature: float
    humidity: float
    pm25: float
    pm10: float
    air_quality: float
    noise: float
    light: float
