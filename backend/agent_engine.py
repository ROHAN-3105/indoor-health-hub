from langchain_core.tools import tool
from datetime import datetime
import pandas as pd
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)
from sklearn.linear_model import LinearRegression
import numpy as np

# Import internal modules (assuming this file is in backend/ and so is main.py/db.py etc)
# We need to access shared state. In a real app we might use a database or redis.
# For now we will import DEVICE_STATE and DEVICE_HISTORY from main if possible,
# or better, access them via getter functions or by importing the module that holds them.
# Since main.py holds them, we might encounter circular imports if main imports this.
# So we should probably move the STATE to a separate store.py or similar.
# BUT, for this task, I will import main inside the functions to avoid top-level circular import issues,
# or assume we can move state to a shared module.
# Let's try importing main inside the methods for now.

# Also need access to health_engine
import health_engine

# --- TOOLS ---

@tool
def get_live_telemetry(device_id: str) -> str:
    """
    Fetches the latest data (CO2/PM2.5, Temp, Humidity, VOC/Noise) from the sensor.
    Returns a string summary of the current state.
    """
    try:
        from main import DEVICE_STATE
        data = DEVICE_STATE.get(device_id)
        if not data:
            return "No live data available for this device. It might be offline."
        
        # Format the data for the LLM
        return f"Current Telemetry for {device_id}: {data}"
    except ImportError:
        return "Error accessing device state system."
    except Exception as e:
        return f"Error fetching telemetry: {str(e)}"

@tool
def predict_air_trend(device_id: str) -> str:
    """
    Runs a prediction model on recent history to forecast air quality (CO2/PM2.5) for the next 2 hours.
    Returns the forecast.
    """
    try:
        from main import DEVICE_HISTORY
        history = DEVICE_HISTORY.get(device_id, [])
        if len(history) < 5:
            return "Not enough historical data to make a prediction (need at least 5 data points)."

        # Convert to DataFrame
        df = pd.DataFrame(history)
        if 'timestamp' not in df.columns or 'pm25' not in df.columns:
             return "Data format incorrect for prediction."

        # Simple Linear Regression for PM2.5
        # X = minutes from start, Y = PM2.5
        df['time_delta'] = (df['timestamp'] - df['timestamp'].min()).dt.total_seconds() / 60
        X = df[['time_delta']]
        y = df['pm25']

        model = LinearRegression()
        model.fit(X, y)

        # Predict +120 minutes from last point
        last_time = df['time_delta'].max()
        future_times = np.array([[last_time + 60], [last_time + 120]])
        predictions = model.predict(future_times)

        return (f"Prediction based on recent trends:\n"
                f"- In 1 hour: PM2.5 ≈ {predictions[0]:.2f}\n"
                f"- In 2 hours: PM2.5 ≈ {predictions[1]:.2f}\n"
                f"Trend: {'Rising' if predictions[1] > y.iloc[-1] else 'Falling'}")

    except Exception as e:
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
            return "No data to check."
        
        assessment = health_engine.calculate_health_score(data)
        return f"Health Assessment: Score {assessment['score']}/100 ({assessment['level']}). Reasons: {', '.join(assessment['reasons'])}"
    except Exception as e:
        return f"Health check failed: {str(e)}"

@tool
def manage_hardware(device_id: str, device_type: str, state: str) -> str:
    """
    Controls hardware actuators.
    device_type: 'fan', 'purifier', 'humidifier'
    state: 'on', 'off', 'auto', 'boost'
    """
    # In a real app, this would send a command to the ESP32 via MQTT/HTTP.
    # For now, we mock the action and log it.
    print(f"I[HARDWARE CONTROL] Device: {device_id} | Type: {device_type} | State: {state}")
    return f"Successfully set {device_type} to {state} for device {device_id}."

# --- AGENT SETUP ---

SYSTEM_PROMPT = """You are the 'Monacos Health Guardian', a sophisticated AI interface for the Indoor Health Intelligence Platform.
Your goal is to assist users by interpreting sensor data, making health predictions, and providing actionable recommendations.

CAPABILITIES:
1. Real-time Status: Access current CO2, Temperature, Humidity, and VOC levels.
2. Predictive Insights: Forecast when air quality might degrade.
3. Smart Recommendations: Suggest lifestyle changes.
4. Actionable Control: Directly control connected appliances (Fans, Purifiers).

GUIDELINES:
- Tone: Empathetic, expert, and helpful. Use "we" to imply a partnership in health.
- Proactive: Don't just give numbers. Interpret them.
- Clarity: Translate technical data into health outcomes.
- If a user asks generic questions, answer them generally but try to tie it back to their room data if relevant.
"""

def get_agent_executor():
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.agents import AgentExecutor, create_tool_calling_agent
    from langchain_core.prompts import ChatPromptTemplate
    
    import os
    # Using gemini-2.0-flash (available with current API key)
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    tools = [get_live_telemetry, predict_air_trend, check_health_standards, manage_hardware]
    
    # Simple tool calling prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Monacos Health Guardian. You communicate in a helpful and empathetic manner. Use the available tools to answer user questions about air quality and device control."),
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

    # We can inject device_id into the prompt context if needed, 
    # but the tools require it as an argument. 
    # The LLM should extract it or we can append it to the query.
    
    # Making the context clear to the agent
    enhanced_input = f"Context: User is asking about Device ID: {device_id}. Query: {input_text}"
    
    try:
        result = agent_executor.invoke({"input": enhanced_input})
        return result["output"]
    except Exception as e:
        print(f"!!! GEMINI API ERROR: {e}")
        # Re-raise so main.py can catch it and return 429
        raise e
