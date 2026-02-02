import requests
import sys

BASE_URL = "http://localhost:8000"

def test_signup_login():
    print("Testing Auth Flow...")
    
    username = "test_user_av"
    password = "test_password_123"
    
    # Signup
    print(f"1. Attempting signup for {username}...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json={"username": username, "password": password})
        if resp.status_code == 200:
            print("   ✅ Signup success:", resp.json())
        elif resp.status_code == 400 and "already registered" in resp.text:
             print("   ⚠️ User already exists (expected if re-running)")
        else:
            print(f"   ❌ Signup failed: {resp.status_code}")
            print(f"   ❌ Error Response: {resp.text}")
            return
    except Exception as e:
        print(f"   ❌ Signup Exception: {e}")
        return

    # Login
    print(f"2. Attempting login for {username}...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={"username": username, "password": password})
        if resp.status_code == 200:
            data = resp.json()
            if "access_token" in data:
                print("   ✅ Login success. Token received.")
            else:
                print("   ❌ Login success but no token?", data)
        else:
            print(f"   ❌ Login failed: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"   ❌ Login Exception: {e}")

if __name__ == "__main__":
    test_signup_login()
