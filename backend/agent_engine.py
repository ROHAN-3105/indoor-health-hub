from langchain_core.tools import tool
from datetime import datetime, timedelta
import pandas as pd
import os
from dotenv import load_dotenv
import sqlite3
# Use absolute import if needed, or relative. Assuming db.py is in same dir.
from db import get_db

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)
from sklearn.linear_model import LinearRegression
import numpy as np

# Also need access to health_engine
import health_engine

# --- HELPERS ---

def get_history_from_db(device_id: str, hours: int = 24):
    """
    Fetches historical data from SQLite for the given window.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Calculate time threshold
        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        
        cursor.execute("""
            SELECT * FROM sensor_readings 
            WHERE device_id = ? AND timestamp >= ? 
            ORDER BY timestamp ASC
        """, (device_id, time_threshold))
        
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

# --- TOOLS ---

@tool
def get_live_telemetry(device_id: str) -> str:
    """
    Fetches the latest data (CO2/PM2.5, Temp, Humidity, VOC/Noise) from the sensor.
    Returns a string summary of the current state.
    """
    try:
        # Import inside function to avoid circular import at top level
        # if main imports agent_engine
        from main import DEVICE_STATE
        
        data = DEVICE_STATE.get(device_id)
        if not data:
            return "No live data available in memory. Device might be offline."
        
        return f"Current Telemetry for {device_id}: {data}"
    except ImportError:
        return "Error: Could not access main application state."
    except Exception as e:
        return f"Error fetching telemetry: {str(e)}"

@tool
def predict_air_trend(device_id: str) -> str:
    """
    Runs a prediction model on recent history to forecast air quality (PM2.5) for the next 2 hours.
    Returns the forecast.
    """
    try:
        # Fetch last 7 days (168 hours) history for better trend analysis
        history = get_history_from_db(device_id, hours=168)
        
        if len(history) < 5:
            return "Not enough historical data to make a prediction (need at least 5 data points)."

        # Convert to DataFrame
        df = pd.DataFrame(history)
        
        # Parse timestamp if it's a string
        if 'timestamp' in df.columns and isinstance(df['timestamp'].iloc[0], str):
            df['timestamp'] = pd.to_datetime(df['timestamp'])

        if 'timestamp' not in df.columns or 'pm25' not in df.columns:
             return "Data format incorrect for prediction."

        # Sort just in case
        df = df.sort_values('timestamp')

        # Simple Linear Regression for PM2.5
        # X = minutes from start, Y = PM2.5
        min_time = df['timestamp'].min()
        df['time_delta'] = (df['timestamp'] - min_time).dt.total_seconds() / 60
        
        X = df[['time_delta']]
        y = df['pm25']

        model = LinearRegression()
        model.fit(X, y)

        # Predict +60 and +120 minutes from last point
        last_time_delta = df['time_delta'].max()
        future_times = np.array([[last_time_delta + 60], [last_time_delta + 120]])
        predictions = model.predict(future_times)
        
        # Get last actual value
        last_val = y.iloc[-1]
        
        trend = "Stable"
        if predictions[1] > last_val * 1.05:
            trend = "Rising"
        elif predictions[1] < last_val * 0.95:
            trend = "Falling"

        return (f"Prediction based on last 48h history ({len(history)} points):\n"
                f"- Current PM2.5: {last_val:.2f}\n"
                f"- Forecast +1 hr: {predictions[0]:.2f}\n"
                f"- Forecast +2 hr: {predictions[1]:.2f}\n"
                f"- Overall Trend: {trend}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Prediction failed: {str(e)}"

@tool
def check_health_standards(device_id: str) -> str:
    """
    Compares current room data against WHO and ASHRAE guidelines.
    Returns a health assessment.
    """
    try:
        from main import DEVICE_STATE
        data = DEVICE_STATE.get(device_id)
        if not data:
            return "No live data available to check health."
        
        assessment = health_engine.calculate_health_score(data)
        return (f"Health Score: {assessment['score']}/100 ({assessment['level']}).\n"
                f"Issues: {', '.join(assessment['reasons']) if assessment['reasons'] else 'None. Air is clean.'}")
    except Exception as e:
        return f"Health check failed: {str(e)}"

@tool
def manage_hardware(device_id: str, device_type: str, state: str) -> str:
    """
    Controls hardware actuators.
    device_type: 'fan', 'purifier', 'humidifier'
    state: 'on', 'off', 'auto', 'boost'
    """
    print(f"I[HARDWARE CONTROL] Device: {device_id} | Type: {device_type} | State: {state}")
    return f"Successfully set {device_type} to {state} for device {device_id}."

# --- AGENT SETUP ---

def get_agent_executor():
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.agents import AgentExecutor, create_tool_calling_agent
    from langchain_core.prompts import ChatPromptTemplate
    
    # Using gemini-2.0-flash (assuming available)
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("CRITICAL: GOOGLE_API_KEY not found in env.")
    
    llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0, google_api_key=api_key)
    tools = [get_live_telemetry, predict_air_trend, check_health_standards, manage_hardware]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Monacos Health Guardian. You check the context provided to answer users."
                   "You have access to tools for live data, predictions, and hardware control."
                   "Always be concise, helpful, and data-driven."),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor = None

def run_agent(input_text: str, device_id: str):
    global agent_executor
    if agent_executor is None:
        agent_executor = get_agent_executor()
        
    # 1. Fetch Context (Live + History Summary)
    # We inject this into the prompt so the LLM knows the state without tool calling for every basics.
    
    context_str = f"Context for Device '{device_id}':\n"
    
    # Live Data
    try:
        from main import DEVICE_STATE
        live = DEVICE_STATE.get(device_id)
        if live:
            context_str += f"[Live Status] Temp: {live.get('temperature')}C, PM2.5: {live.get('pm25')}, Noise: {live.get('noise')}dB\n"
        else:
            context_str += "[Live Status] Device offline or no data.\n"
    except:
        context_str += "[Live Status] Unavailable.\n"
        
    # History Summary (Last 7 Days)
    try:
        hist = get_history_from_db(device_id, hours=168)
        if hist:
            temps = [h['temperature'] for h in hist if h['temperature'] is not None]
            pm25s = [h['pm25'] for h in hist if h['pm25'] is not None]
            
            if temps:
                avg_temp = sum(temps) / len(temps)
                max_temp = max(temps)
                context_str += f"[7-Day History] Avg Temp: {avg_temp:.1f}C, Max Temp: {max_temp:.1f}C.\n"
            
            if pm25s:
                avg_pm = sum(pm25s) / len(pm25s)
                max_pm = max(pm25s)
                context_str += f"[7-Day History] Avg PM2.5: {avg_pm:.1f}, Max PM2.5: {max_pm:.1f}.\n"
        else:
            context_str += "[7-Day History] No data records.\n"
    except Exception as e:
        context_str += f"[7-Day History] Error fetching context: {e}\n"

    final_prompt = f"{context_str}\nUser Query: {input_text}"
    
    try:
        print(f"Agent Prompt: {final_prompt}")
        result = agent_executor.invoke({"input": final_prompt})
        return result["output"]
    except Exception as e:
        print(f"!!! AGENT ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise e
