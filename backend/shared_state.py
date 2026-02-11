from typing import Dict, List

# ---------------------------
# IN-MEMORY STORAGE
# ---------------------------

DEVICE_STATE: Dict[str, dict] = {}
DEVICE_HISTORY: Dict[str, List[dict]] = {}
DEVICE_ALERTS: Dict[str, List[dict]] = {}
