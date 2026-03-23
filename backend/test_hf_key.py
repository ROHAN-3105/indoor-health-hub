from huggingface_hub import InferenceClient
import os

# API Key from .env
API_KEY = "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"

# Models to try
MODELS = [
    "google/flan-t5-large",
    "google/flan-t5-base",
    "gpt2"
]

print(f"Testing Hugging Face API Key: {API_KEY[:5]}...")

for model_id in MODELS:
    try:
        print(f"Testing {model_id}...")
        client = InferenceClient(model=model_id, token=API_KEY)
        
        # Simple test generation
        output = client.text_generation("Hello! Reply 'OK'.", max_new_tokens=10)
        
        print(f"\n✅ SUCCESS with {model_id}!")
        print(f"Response: {output}")
        break

    except Exception as e:
        print(f"[{model_id}] Failed: {e}")
