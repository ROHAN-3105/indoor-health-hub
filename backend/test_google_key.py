import google.generativeai as genai
import os
import sys
import time

# User provided key from .env file
KEY = "AIzaSyCKMgORFes2QYx2SDOcj5fxLhUm8vl66I4"

LOG_FILE = "test_key_result.txt"

def log(msg):
    print(msg)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

# Clear previous log
with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write("Testing Google Key #7...\n")

log(f"Testing Google API Key: {KEY[:10]}...")

candidate_models = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

try:
    genai.configure(api_key=KEY)
    
    log("Starting Model Compatibility Check...")
    
    for model_name in candidate_models:
        log(f"Testing {model_name}...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Reply 'OK'.")
            if response.text:
                log(f"✅ SUCCESS: {model_name} is WORKING!")
                log(f"Response: {response.text}")
                # If we find one working, that's great, but let's see which others work too
        except Exception as e:
            err_str = str(e)
            if "404" in err_str:
                log(f"❌ {model_name}: Not Found / Not Supported")
            elif "429" in err_str:
                log(f"⚠️ {model_name}: Quota Exceeded (Free Tier Limit)")
            else:
                log(f"❌ {model_name}: Error {err_str[:100]}...")

except Exception as e:
    log("\n❌ FAILED to configure!")
    log(f"Error: {e}")
