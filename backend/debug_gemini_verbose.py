import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

print(f"Key: {api_key[:10]}...")
genai.configure(api_key=api_key)

# Try a standard, known stable model if specific versions fail
model_name = "models/gemini-1.5-flash" 

print(f"Attempting to generate with {model_name}...")

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello, can you hear me?")
    print("SUCCESS!")
    print(response.text)
except Exception as e:
    print("\n--- ERROR DETAILS ---")
    print(f"Type: {type(e)}")
    print(f"String: {e}")
    if hasattr(e, 'args'):
        print(f"Args: {e.args}")
        
    print("\n--- LISTING MODELS AGAIN ---")
    try:
        for m in genai.list_models():
             if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as list_e:
        print(f"List Error: {list_e}")
