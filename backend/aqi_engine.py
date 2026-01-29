# backend/aqi_engine.py

def calculate_sub_index(concentration, breakpoints):
    for bp in breakpoints:
        if bp["c_low"] <= concentration <= bp["c_high"]:
            return round(
                ((bp["i_high"] - bp["i_low"]) /
                 (bp["c_high"] - bp["c_low"])) *
                (concentration - bp["c_low"]) +
                bp["i_low"]
            )
    return None


PM25_BREAKPOINTS = [
    {"c_low": 0.0, "c_high": 12.0, "i_low": 0, "i_high": 50},
    {"c_low": 12.1, "c_high": 35.4, "i_low": 51, "i_high": 100},
    {"c_low": 35.5, "c_high": 55.4, "i_low": 101, "i_high": 150},
    {"c_low": 55.5, "c_high": 150.4, "i_low": 151, "i_high": 200},
    {"c_low": 150.5, "c_high": 250.4, "i_low": 201, "i_high": 300},
]


PM10_BREAKPOINTS = [
    {"c_low": 0, "c_high": 54, "i_low": 0, "i_high": 50},
    {"c_low": 55, "c_high": 154, "i_low": 51, "i_high": 100},
    {"c_low": 155, "c_high": 254, "i_low": 101, "i_high": 150},
    {"c_low": 255, "c_high": 354, "i_low": 151, "i_high": 200},
    {"c_low": 355, "c_high": 424, "i_low": 201, "i_high": 300},
]


def get_aqi_category(aqi: int):
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Poor"
    elif aqi <= 200:
        return "Unhealthy"
    else:
        return "Severe"


def calculate_pm_aqi(pm25: float, pm10: float):
    aqi_pm25 = calculate_sub_index(pm25, PM25_BREAKPOINTS)
    aqi_pm10 = calculate_sub_index(pm10, PM10_BREAKPOINTS)

    valid_indices = [i for i in [aqi_pm25, aqi_pm10] if i is not None]

    if not valid_indices:
        return None

    final_aqi = max(valid_indices)

    return {
        "aqi": final_aqi,
        "category": get_aqi_category(final_aqi),
        "basis": "PM2.5 & PM10 (Particulate-based)",
        "components": {
            "pm25_aqi": aqi_pm25,
            "pm10_aqi": aqi_pm10,
        }
    }
