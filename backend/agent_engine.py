import google.generativeai as genai
import os
import time
import random
from dotenv import load_dotenv
from db import get_db

# Load env safely
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    # Just a warning, main app handles it
    print("Warning: GOOGLE_API_KEY not found.")
else:
    genai.configure(api_key=api_key)

import math
from datetime import datetime, timedelta

def simple_linear_regression(y_values):
    """
    Predicts next 5 values using simple linear regression (y = mx + b).
    Input: list of y values (ordered by time).
    Output: list of 5 predicted y values.
    """
    n = len(y_values)
    if n < 2:
        return [y_values[-1]] * 5 if n == 1 else [0] * 5

    x = list(range(n))
    y = y_values

    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(i * j for i, j in zip(x, y))
    sum_xx = sum(i * i for i in x)

    # Calculate slope (m) and intercept (b)
    denominator = n * sum_xx - sum_x * sum_x
    if denominator == 0:
        m = 0
    else:
        m = (n * sum_xy - sum_x * sum_y) / denominator
    
    b = (sum_y - m * sum_x) / n

    # Predict next 5 points (indices n, n+1, n+2, n+3, n+4)
    predictions = []
    for i in range(1, 6):
        next_x = n - 1 + i # Continue x sequence
        pred_y = m * next_x + b
        predictions.append(round(pred_y, 1))
    
    return predictions

def get_live_context(device_id: str):
    """Fetches live context AND calculates 5-hour forecast."""
    context_str = f"Context for Device '{device_id}':\n"
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # 1. Get Latest Reading
        cursor.execute("""
            SELECT * FROM sensor_readings 
            WHERE device_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 1
        """, (device_id,))
        row = cursor.fetchone()
        
        if row:
            data = dict(row)
            context_str += f"[Live Reading] Temp: {data.get('temperature')}C, Humidity: {data.get('humidity')}%, PM2.5: {data.get('pm25')}, AQI: {data.get('aqi')}, Score: {data.get('air_quality_score')}\n"
        else:
            context_str += "[Live Reading] No recent data found.\n"
            conn.close()
            return context_str

        # 2. Get Historical Data (Last 24 hours) for Prediction
        # We limit to 50 points to keep it fast/simple
        cursor.execute("""
            SELECT temperature, humidity, pm25 FROM sensor_readings 
            WHERE device_id = ? 
            ORDER BY timestamp ASC 
            LIMIT 100
        """, (device_id,))
        history = cursor.fetchall()
        conn.close()
        
        if len(history) > 5:
            temps = [r[0] for r in history if r[0] is not None]
            hums = [r[1] for r in history if r[1] is not None]
            pm25s = [r[2] for r in history if r[2] is not None]
            
            pred_temp = simple_linear_regression(temps)
            pred_hum = simple_linear_regression(hums)
            pred_pm25 = simple_linear_regression(pm25s)
            
            context_str += (
                f"\n[AI Forecast - Next 5 Hours]\n"
                f"Based on historical trend (Linear Regression):\n"
                f"- Predicted Temperature: {pred_temp} (Trend)\n"
                f"- Predicted Humidity: {pred_hum} (Trend)\n"
                f"- Predicted PM2.5: {pred_pm25} (Trend)\n"
            )
        else:
            context_str += "\n[AI Forecast] Not enough data to predict trends yet.\n"
            
    except Exception as e:
        context_str += f"[Error] Could not fetch live data: {e}\n"
        
    return context_str

def run_agent(user_message: str, device_id: str):
    if not api_key:
        return "System Error: GOOGLE_API_KEY not found in backend configuration."

    context = get_live_context(device_id)
    
    system_instruction = (
        "You are 'Monacos Health Guardian', an AI assistant for indoor air quality. "
        "You have access to live sensor data AND a 5-hour scientific forecast in the context. "
        
        "CRITICAL RULES FOR RESPONSE:"
        "1. BE CONCISE. Keep answers under 2-3 sentences unless asked for details."
        "2. PRECISE DATA. State the values clearly (e.g., 'Temp is 24°C')."
        "3. NO UNASKED REASONING. Do NOT explain 'Why' or 'How' unless the user asks."
        "4. FUTURE PREDICTIONS. If asked about the future, use the [AI Forecast] section."
        "5. SAFETY. If values are hazardous, give a 1-sentence warning."
        "6. PLAIN TEXT ONLY. Do NOT use markdown (**bold**, etc)."
        
        "Example Interaction:"
        "User: How is the air?"
        "Agent: The air quality is Good. PM2.5 is 13.4 µg/m³ and stable."
    )
    
    final_prompt = f"{context}\n\nUser: {user_message}"
    
    # Retry Logic (Exponential Backoff)
    max_retries = 3
    base_delay = 2
    
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel(
                model_name="models/gemini-flash-latest",
                system_instruction=system_instruction
            )
            chat = model.start_chat()
            response = chat.send_message(final_prompt)
            return response.text
            
        except Exception as e:
            error_msg = str(e)
            print(f"Gemini Attempt {attempt+1} failed: {error_msg}")
            
            # Check for Quota/Rate Limit
            if "429" in error_msg or "quota" in error_msg.lower() or "resource_exhausted" in error_msg.lower():
                if attempt < max_retries - 1:
                    sleep_time = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    print(f"Retrying in {sleep_time:.2f}s...")
                    time.sleep(sleep_time)
                    continue
                else:
                    # Fallback to smart offline mode
                    import re
                    
                    # Parse values
                    temp_match = re.search(r"Temp: ([\d.]+)C", context)
                    score_match = re.search(r"Score: ([\d.]+)", context)
                    aqi_match = re.search(r"AQI: ([\d.]+)", context)
                    
                    temp = temp_match.group(1) if temp_match else "Unknown"
                    score = score_match.group(1) if score_match else "Unknown"
                    aqi = aqi_match.group(1) if aqi_match else "Unknown"
                    
                    msg_lower = user_message.lower()
                    
                    # Smart Rule-Based Responses
                    if "temp" in msg_lower:
                        return f"Offline Mode: The current temperature is {temp}°C."
                    elif "score" in msg_lower or "health" in msg_lower:
                        return f"Offline Mode: Your room health score is {score}/100."
                    elif "aqi" in msg_lower or "air" in msg_lower:
                        return f"Offline Mode: The Air Quality Index (AQI) is {aqi}."
                    elif "hello" in msg_lower or "hi" in msg_lower:
                        return "Offline Mode: Hello! I'm currently running in low-power mode, but I can still read your sensors. Ask me about temperature or AQI."
                    else:
                        return (f"Offline Mode (API Quota)\n\n"
                                f"I can't chat normally right now, but here are your stats:\n"
                                f"- Temp: {temp}°C\n"
                                f"- AQI: {aqi}\n"
                                f"- Score: {score}/100")
            else:
                # Other error
                return f"I encountered an error: {error_msg}"
    
    return "Something went wrong. Please try again."
