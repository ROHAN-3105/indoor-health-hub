import sqlite3
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import os

# Database configuration
DB_NAME = "monacos.db"
DEVICE_ID = "monacos_room_01"

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_NAME)
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def fetch_historical_data(device_id, metric, limit=1000):
    """
    Fetches historical data for a specific metric from the database.
    """
    conn = get_db_connection()
    if not conn:
        return None

    query = f"""
        SELECT timestamp, {metric}
        FROM sensor_readings
        WHERE device_id = ?
        ORDER BY timestamp ASC
        LIMIT ?
    """
    
    try:
        df = pd.read_sql_query(query, conn, params=(device_id, limit))
        conn.close()
        
        # Convert timestamp to datetime objects
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Convert timestamp to numerical value (seconds since epoch) for regression
        # We use a reference point (start time) to keep numbers smaller/manageable
        if not df.empty:
            start_time = df['timestamp'].min()
            df['seconds_since_start'] = (df['timestamp'] - start_time).dt.total_seconds()
            return df, start_time
        return df, None
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        conn.close()
        return None, None

def train_and_predict(device_id, metric, hours_ahead=24):
    """
    Trains a linear regression model and predicts future values.
    """
    print(f"\n--- Analysis for {metric.upper()} ---")
    
    # 1. Fetch Data
    df, start_time = fetch_historical_data(device_id, metric)
    
    if df is None or df.empty:
        print(f"No data found for device {device_id}")
        return

    # 2. Prepare Data for Scikit-Learn
    # X = Feature (Time), y = Target (Metric value)
    X = df[['seconds_since_start']]
    y = df[metric]

    # 3. Train Model
    model = LinearRegression()
    model.fit(X, y)

    # 4. Analyze Model
    slope = model.coef_[0]
    intercept = model.intercept_
    r_squared = model.score(X, y)
    
    print(f"Model Trained: {metric} = {slope:.6f} * time + {intercept:.2f}")
    print(f"R-squared (Accuracy): {r_squared:.4f}")
    
    if r_squared < 0.1:
        print("Note: Low R-squared indicates linear trend is weak (data might be cyclic or noisy).")

    # 5. Predict Future
    # Generate future timestamps
    last_real_time = df['timestamp'].max()
    future_times = [last_real_time + timedelta(hours=i) for i in range(1, hours_ahead + 1)]
    
    # Convert future times to seconds since start
    future_seconds = [(t - start_time).total_seconds() for t in future_times]
    future_X = pd.DataFrame(future_seconds, columns=['seconds_since_start'])
    
    # Predict
    predictions = model.predict(future_X)
    
    print(f"\nPredictions for next {hours_ahead} hours:")
    for t, pred in zip(future_times, predictions):
        print(f"  {t.strftime('%Y-%m-%d %H:%M')}: {pred:.2f}")
        
    return model, predictions

if __name__ == "__main__":
    # Ensure we are in the backend directory or path is correct relative to execution
    # This logic assumes script is run from project root or backend folder
    if not os.path.exists(DB_NAME):
        # Try finding it if we are in backend folder
        if os.path.exists(os.path.join("backend", DB_NAME)):
             DB_NAME = os.path.join("backend", DB_NAME)
    
    metrics_to_predict = ['temperature', 'humidity', 'pm25']
    
    print(f"Running Linear Regression Prediction for {DEVICE_ID}...")
    
    for metric in metrics_to_predict:
        train_and_predict(DEVICE_ID, metric)
