import sqlite3
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import os

# Database configuration
DB_NAME = "monacos.db"
DEVICE_ID = "monacos_room_01"

# WHO Standards & ASHRAE (Reference for thresholds)
WHO_STANDARDS = {
    "pm25": {"limit": 15.0, "period": "24h mean", "desc": "WHO Air Quality Guideline"},
    "pm10": {"limit": 45.0, "period": "24h mean", "desc": "WHO Air Quality Guideline"},
    "temperature": {"min": 18.0, "max": 24.0, "desc": "General Comfort/Health (ASHRAE)"},
    "humidity": {"min": 40.0, "max": 60.0, "desc": "General Comfort/Health (ASHRAE)"}
}

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    try:
        if not os.path.exists(DB_NAME) and os.path.exists(os.path.join("backend", DB_NAME)):
             # Handle running from root vs backend dir
             db_path = os.path.join("backend", DB_NAME)
        else:
             db_path = DB_NAME

        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def fetch_training_data(device_id, limit=5000):
    """
    Fetches historical data for all metrics from the database.
    Now includes: temperature, humidity, pm25, pm10, noise, light, pressure
    """
    conn = get_db_connection()
    if not conn:
        return None

    # We select ALL columns we need for the correlation logic
    # Note: 'pressure', 'light', 'noise' might be null in some rows if old data exists
    query = """
        SELECT timestamp, temperature, humidity, pm25, pm10, noise, light, pressure
        FROM sensor_readings
        WHERE device_id = ?
        ORDER BY timestamp ASC
        LIMIT ?
    """
    
    try:
        df = pd.read_sql_query(query, conn, params=(device_id, limit))
        conn.close()
        
        if df.empty:
            return None
            
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Fill missing values (forward fill then backward fill) to handle sensor dropouts
        # This is critical for the model to not choke on NaNs
        df = df.fillna(method='ffill').fillna(method='bfill').fillna(0)
        
        return df
    except Exception as e:
        print(f"Error fetching data: {e}")
        conn.close()
        return None

def prepare_features(df):
    """
    Feature Engineering with Resampling and Lags.
    """
    # 1. Resample to 1-Hour intervals (taking mean)
    #    This standardizes the timeline and smooths out noise.
    df = df.set_index('timestamp').resample('1H').mean().interpolate()
    df = df.reset_index()

    # 2. Generate Time Features
    start_time = df['timestamp'].min()
    df['seconds_since_start'] = (df['timestamp'] - start_time).dt.total_seconds()
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)

    # 3. Create Lags (t-1) for ALL targets
    #    The model predicts t using t-1 values.
    #    targets = ['temperature', 'humidity', 'pm25', 'pm10', 'noise', 'light', 'pressure']
    
    targets = ['temperature', 'humidity', 'pm25', 'pm10', 'noise', 'light', 'pressure']
    
    for col in targets:
        df[f'{col}_lag_1'] = df[col].shift(1)
        
    # Drop the first row which has NaNs due to shifting
    df = df.dropna()

    # Define Feature Columns (X)
    feature_cols = [
        'seconds_since_start', 'hour', 'day_of_week', 'is_weekend',
        'temperature_lag_1', 'humidity_lag_1', 'pm25_lag_1', 'pm10_lag_1',
        'noise_lag_1', 'light_lag_1', 'pressure_lag_1'
    ]
    
    return df, feature_cols, targets, start_time

def check_standards(predictions_df):
    """
    Evaluates predictions against WHO/Health standards.
    """
    alerts = []
    
    # Calculate means
    avg_pm25 = predictions_df['pm25'].mean()
    avg_pm10 = predictions_df['pm10'].mean()
    avg_temp = predictions_df['temperature'].mean()
    avg_humidity = predictions_df['humidity'].mean()
    
    # Check PM2.5
    if avg_pm25 > WHO_STANDARDS['pm25']['limit']:
        alerts.append({
            "metric": "PM2.5",
            "value": round(avg_pm25, 2),
            "threshold": WHO_STANDARDS['pm25']['limit'],
            "status": "EXCEEDED",
            "message": f"Predicted 24h average ({round(avg_pm25, 1)}) exceeds WHO guideline of {WHO_STANDARDS['pm25']['limit']}."
        })
    
    # Check PM10
    if avg_pm10 > WHO_STANDARDS['pm10']['limit']:
        alerts.append({
            "metric": "PM10",
            "value": round(avg_pm10, 2),
            "threshold": WHO_STANDARDS['pm10']['limit'],
            "status": "EXCEEDED",
            "message": f"Predicted 24h average ({round(avg_pm10, 1)}) exceeds WHO guideline of {WHO_STANDARDS['pm10']['limit']}."
        })
        
    # Check Temperature
    if avg_temp < WHO_STANDARDS['temperature']['min'] or avg_temp > WHO_STANDARDS['temperature']['max']:
        alerts.append({
            "metric": "Temperature",
            "value": round(avg_temp, 2),
            "threshold": f"{WHO_STANDARDS['temperature']['min']}-{WHO_STANDARDS['temperature']['max']}",
            "status": "WARNING",
            "message": f"Predicted average temp ({round(avg_temp, 1)}°C) is outside comfort range."
        })

    return alerts

def generate_predictions(device_id=DEVICE_ID, hours_ahead=24):
    """
    Recursive Multi-Target Prediction.
    """
    # 1. Fetch Data
    raw_df = fetch_training_data(device_id)
    if raw_df is None or len(raw_df) < 24: # Need at least 24 points for resampling to work well
        return {"error": "Not enough data to generate predictions (need at least 24 hours of data)"}

    # 2. Prepare Features (Training Data)
    df, feature_cols, targets, start_time = prepare_features(raw_df)
    
    if df.empty:
         return {"error": "Not enough data after resampling"}

    X = df[feature_cols]
    y = df[targets]

    # 3. Model Training (Random Forest)
    #    We train ONE model that predicts ALL targets at once.
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)
    
    # 4. Recursive Forecasting Loop
    #    We need to predict t+1, then use that as input for t+2...
    
    # Initial "Last Known State" (from the very last row of our training data)
    last_row = df.iloc[-1]
    
    current_time = last_row['timestamp']
    current_lags = {
        'temperature_lag_1': last_row['temperature'],
        'humidity_lag_1': last_row['humidity'],
        'pm25_lag_1': last_row['pm25'],
        'pm10_lag_1': last_row['pm10'],
        'noise_lag_1': last_row['noise'],
        'light_lag_1': last_row['light'],
        'pressure_lag_1': last_row['pressure']
    }
    
    forecast_results = []
    
    for i in range(1, hours_ahead + 1):
        next_time = current_time + timedelta(hours=1)
        
        # Construct Input Vector X_next
        seconds_since = (next_time - start_time).total_seconds()
        hour = next_time.hour
        day_of_week = next_time.dayofweek
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Input features must match training order!
        input_features = [
            seconds_since, hour, day_of_week, is_weekend,
            current_lags['temperature_lag_1'],
            current_lags['humidity_lag_1'],
            current_lags['pm25_lag_1'],
            current_lags['pm10_lag_1'],
            current_lags['noise_lag_1'],
            current_lags['light_lag_1'],
            current_lags['pressure_lag_1']
        ]
        
        # Predict
        # model.predict expects 2D array
        prediction = model.predict([input_features])[0] # returns [temp, hum, pm25, pm10, noise, light, pressure]
        
        # Map prediction back to labels
        pred_dict = dict(zip(targets, prediction))
        
        # Store result
        result_entry = {
            "timestamp": next_time,
            "temperature": pred_dict['temperature'],
            "humidity": pred_dict['humidity'],
            "pm25": pred_dict['pm25'],
            "pm10": pred_dict['pm10'],
            # We don't necessarily show noise/light/pressure in the forecast chart 
            # unless requested, but we have them. 
            # For now, let's keep the API response clean with just the requested 4 + others if useful?
            # Let's include them for debugging/completeness.
            "noise": pred_dict['noise'],
            "light": pred_dict['light'],
            "pressure": pred_dict['pressure']
        }
        forecast_results.append(result_entry)
        
        # UPDATE Lags for next iteration
        # The PREDICTED values become the LAGS for the next hour
        current_lags['temperature_lag_1'] = pred_dict['temperature']
        current_lags['humidity_lag_1'] = pred_dict['humidity']
        current_lags['pm25_lag_1'] = pred_dict['pm25']
        current_lags['pm10_lag_1'] = pred_dict['pm10']
        current_lags['noise_lag_1'] = pred_dict['noise']
        current_lags['light_lag_1'] = pred_dict['light']
        current_lags['pressure_lag_1'] = pred_dict['pressure']
        
        current_time = next_time

    # 5. Format Output
    pred_df = pd.DataFrame(forecast_results)
    
    results = {
        "model_info": {
            "type": "Recursive Multi-Target Random Forest",
            "factors_used": [
                "Time Features (Hour, Day, Weekend)",
                "Autoregression (Lags of all metrics)",
                "Cross-sensor correlations (e.g. Light -> Temp)"
            ],
            "trained_on_samples": len(df)
        },
        "forecast": [],
        "alerts": check_standards(pred_df)
    }
    
    for _, row in pred_df.iterrows():
        results['forecast'].append({
            "timestamp": row['timestamp'].isoformat(),
            "temperature": round(row['temperature'], 2),
            "humidity": round(row['humidity'], 2),
            "pm25": round(row['pm25'], 2),
            "pm10": round(row['pm10'], 2),
            # Optional: include others if frontend needs them
            "pressure": round(row['pressure'], 2) if 'pressure' in row else 0,
            "light": round(row['light'], 2) if 'light' in row else 0,
        })
        
    return results

if __name__ == "__main__":
    print(f"Generating recursive predictions for {DEVICE_ID}...")
    output = generate_predictions()
    import json
    print(json.dumps(output, indent=2, default=str))
