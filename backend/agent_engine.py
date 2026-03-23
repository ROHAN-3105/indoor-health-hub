from openai import OpenAI
import os
import time
import random
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv
from db import get_db
from shared_state import DEVICE_STATE

# Load env safely
load_dotenv()

# We don't initialize a global client here to allow dynamic env loading if user adds key later without restart (partially)
# But best practice is to init client inside function or global if key is static.

def predict_with_explanation(history_data, target_name):
    """
    Predicts next 5 hours using Multiple Linear Regression.
    Features: 
    1. Time Trend (Ordinal timestamp)
    2. Hour of Day (Cyclical pattern approximation)
    
    Returns:
    - predictions: List of 5 predicted values
    - explanation: String explaining the logic (coefficients)
    """
    if len(history_data) < 5:
        return [], "Not enough data for prediction."

    df = pd.DataFrame(history_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Feature Engineering
    df['time_ordinal'] = df['timestamp'].apply(lambda x: x.toordinal())
    df['hour'] = df['timestamp'].dt.hour
    
    # Normalize features for somewhat comparable coefficients (simple MinMax for explanation sake)
    # Actually for simple explanation, raw coefficients on normalized data or just generic trend description is better.
    # Let's keep it simple: Use raw values but explain trend direction.
    
    X = df[['time_ordinal', 'hour']]
    y = df['value']
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next 5 hours
    last_time = df['timestamp'].max()
    future_times = [last_time + pd.Timedelta(hours=i) for i in range(1, 6)]
    
    future_X = pd.DataFrame({
        'time_ordinal': [t.toordinal() for t in future_times],
        'hour': [t.hour for t in future_times]
    })
    
    predictions = model.predict(future_X)
    predictions = [round(val, 2) for val in predictions]
    
    # Generate Explanation
    # Coefficients
    time_coef = model.coef_[0]
    hour_coef = model.coef_[1]
    r2_score = model.score(X, y) # simplistic in-sample R2
    
    trend_desc = "steady"
    if time_coef > 0.001: trend_desc = "increasing"
    elif time_coef < -0.001: trend_desc = "decreasing"
    
    hour_desc = "negligible"
    if abs(hour_coef) > 0.1:
        hour_desc = "significant"
    
    # Calculate duration
    duration = last_time - df['timestamp'].min()
    days = duration.days
    hours = duration.seconds // 3600
    if days > 0:
        duration_str = f"{days} days and {hours} hours"
    else:
        duration_str = f"{hours} hours"

    explanation = (
        f"I used a Multiple Linear Regression model trained on the last {duration_str} of sensor readings ({len(history_data)} data points). "
        f"The model analyzed two key factors: overall trend and daily cycles. "
        f"For {target_name}, I identified a {trend_desc} long-term trend, and the time of day has a {hour_desc} influence. "
        f"The model explains approximately {int(r2_score*100)}% of the variance."
    )
    
    return predictions, explanation

def get_live_context(device_id: str):
    """Fetches live context AND calculates 5-hour forecast with explanation."""
    context_str = f"Context for Device '{device_id}':\n"
    
    # 1. LIVE DATA (Memory or DB)
    if device_id in DEVICE_STATE:
        data = DEVICE_STATE[device_id]
        context_str += f"[Live Reading] Temp: {data.get('temperature')}C, Humidity: {data.get('humidity')}%, PM2.5: {data.get('pm25')}, AQI: {data.get('aqi', 'N/A')}, Score: {data.get('air_quality_score', 'N/A')}\n"
    else:
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sensor_readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1", (device_id,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                data = dict(row)
                context_str += f"[Live Reading] Temp: {data.get('temperature')}C, Humidity: {data.get('humidity')}%, PM2.5: {data.get('pm25')}, AQI: {data.get('aqi')}, Score: {data.get('air_quality_score')}\n"
            else:
                context_str += "[Live Reading] No recent data found.\n"
        except Exception as e:
            context_str += f"[Error] Could not fetch live data: {e}\n"
            data = {}

    # 2. FORECAST (Historical Data)
    try:
        conn = get_db()
        cursor = conn.cursor()
        # Fetch timestamp too
        cursor.execute("SELECT timestamp, temperature, humidity, pm25 FROM sensor_readings WHERE device_id = ? ORDER BY timestamp ASC LIMIT 100", (device_id,))
        history = cursor.fetchall()
        conn.close()
        
        if len(history) > 5:
            # Prepare data lists
            temp_data = [{'timestamp': r[0], 'value': r[1]} for r in history if r[1] is not None]
            hum_data = [{'timestamp': r[0], 'value': r[2]} for r in history if r[2] is not None]
            pm25_data = [{'timestamp': r[0], 'value': r[3]} for r in history if r[3] is not None]
            
            pred_temp, exp_temp = predict_with_explanation(temp_data, "Temperature")
            pred_hum, exp_hum = predict_with_explanation(hum_data, "Humidity")
            pred_pm25, exp_pm25 = predict_with_explanation(pm25_data, "PM2.5")
            
            context_str += (
                f"\n[AI Forecast - Next 5 Hours]\n"
                f"Predictions:\n"
                f"- Temperature: {pred_temp}\n"
                f"- Humidity: {pred_hum}\n"
                f"- PM2.5: {pred_pm25}\n\n"
                f"[Model Explanation]\n"
                f"Temperature Logic: {exp_temp}\n"
                f"Humidity Logic: {exp_hum}\n"
                f"PM2.5 Logic: {exp_pm25}\n"
            )
        else:
            context_str += "\n[AI Forecast] Not enough data to predict trends yet.\n"
            
    except Exception as e:
        context_str += f"[Error] Could not fetch history: {e}\n"
        
    return context_str

import google.generativeai as genai

def run_agent(user_message: str, device_id: str):
    openai_key = os.getenv("OPENAI_API_KEY")
    google_key = os.getenv("GOOGLE_API_KEY")
    
    context = get_live_context(device_id)
    
    system_instruction = (
        "You are 'Monacos Health Guardian', an AI assistant for indoor air quality. "
        "You have access to live sensor data AND a 5-hour scientific forecast in the context. "
        
        "CRITICAL RULES FOR RESPONSE:"
        "1. BE CONCISE. Keep answers under 2-3 sentences unless asked for details."
        "2. PRECISE DATA. State the values clearly (e.g., 'Temp is 24°C')."
        "3. EXPLAIN IF ASKED. If the user asks 'Why', 'How did you predict', or for trends, refer exclusively to the [Model Explanation] section in the context."
        "4. FUTURE PREDICTIONS. If asked about the future, use the [AI Forecast] section."
        "5. SAFETY. If values are hazardous, give a 1-sentence warning."
        "6. PLAIN TEXT ONLY. Do NOT use markdown (**bold**, etc)."
        
        "Example Interaction:"
        "User: Predict temp."
        "Agent: Predicted temp for next 5 hours: 24.1, 24.2, 24.3... Trend is increasing."
        "User: How did you know?"
        "Agent: I used a multi-regression model. It found an increasing trend over time and a significant impact from the time of day."
    )
    
    final_prompt = f"{context}\n\nUser: {user_message}"
    
    # ---------------------------
    # PLAN A: OPENAI
    # ---------------------------
    if openai_key:
        client = OpenAI(api_key=openai_key)
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": final_prompt}
                ],
                max_tokens=250,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Error: {e}")
            # Fall through to Gemini or Offline if OpenAI fails
            pass

    # ---------------------------
    # PLAN B: GOOGLE GEMINI
    # ---------------------------
    if google_key:
        # Fallback list of models to try (prioritizing 2.0, then falling back)
        candidate_models = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-2.0-flash-lite-preview-02-05", # Try lite versions
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
        
        genai.configure(api_key=google_key)
        
        last_error = None
        for model_name in candidate_models:
            try:
                # print(f"Trying Gemini Model: {model_name}")   # Debug
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )
                chat = model.start_chat()
                
                # Simple retry for this specific model
                for attempt in range(2):
                    try:
                        response = chat.send_message(final_prompt)
                        return response.text
                    except Exception as e:
                        if "429" in str(e) or "quota" in str(e).lower():
                            time.sleep(1)
                            continue 
                        elif "404" in str(e) or "not found" in str(e).lower():
                            # Model not available for this key, break to next model
                            raise e 
                        else:
                            raise e
                
                # If we get here, we likely succeeded or exhausted retries without raising
                # But actually, the return happens inside the try.
                
            except Exception as e:
                last_error = e
                # validation: if 404 (not found), just try next model.
                # if 429 (quota), also try next model (maybe different quota bucket?)
                continue
        
        if last_error:
            print(f"All Gemini Models failed. Last Error: {last_error}")
            pass

            pass


    # ---------------------------
    # PLAN C: OFFLINE MODE
    # ---------------------------
    import re
    # Parse values
    temp_match = re.search(r"Temp: ([\d.]+)C", context)
    score_match = re.search(r"Score: ([\d.]+)", context)
    aqi_match = re.search(r"AQI: ([\d.]+)", context)
    
    temp = temp_match.group(1) if temp_match else "Unknown"
    score = score_match.group(1) if score_match else "Unknown"
    aqi = aqi_match.group(1) if aqi_match else "Unknown"
    
    msg_lower = user_message.lower()
    
    prefix = "Offline Mode: "
    if not openai_key and not google_key:
        prefix = "Offline Mode (No API Keys Found): "
    elif google_key and not openai_key:
        prefix = "Offline Mode (Gemini Quota): "
    
    # Smart Rule-Based Responses
    if "temp" in msg_lower:
        return f"{prefix}The current temperature is {temp}°C."
    elif "score" in msg_lower or "health" in msg_lower:
        return f"{prefix}Your room health score is {score}/100."
    elif "aqi" in msg_lower or "air" in msg_lower:
        return f"{prefix}The Air Quality Index (AQI) is {aqi}."
    elif "hello" in msg_lower or "hi" in msg_lower:
        return f"{prefix}Hello! I'm currently running in low-power mode, but I can still read your sensors. Ask me about temperature or AQI."
    else:
        return (f"{prefix}\n\n"
                f"I can't chat normally right now, but here are your stats:\n"
                f"- Temp: {temp}°C\n"
                f"- AQI: {aqi}\n"
                f"- Score: {score}/100")

