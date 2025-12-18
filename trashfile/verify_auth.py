import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def post_json(url, data):
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except urllib.error.URLError as e:
        print(f"URL Error: {e.reason}")
        return 0, str(e.reason)

def verify_auth():
    print("Waiting for server...")
    time.sleep(3)
    
    # 1. Signup
    print("Testing Signup...")
    signup_data = {
        "name": "Verify User",
        "email": "verify@example.com",
        "password": "secretpassword",
        "phone": "1234567890",
        "role": "student"
    }
    
    status, body = post_json(f"{BASE_URL}/users/signup", signup_data)
    
    if status == 200:
        print("Signup Success:", body)
    elif status == 400 and "Email already exists" in str(body):
        print("User already exists, proceeding to login.")
    else:
        print(f"Signup Failed: {status} {body}")
        return

    # 2. Login
    print("Testing Login...")
    login_data = {
        "email": "verify@example.com",
        "password": "secretpassword"
    }
    
    status, body = post_json(f"{BASE_URL}/auth/login", login_data)
    
    if status == 200:
        print("Login Success. Token received.")
        print(f"Token type: {body.get('token_type')}")
        if not body.get("access_token"):
            print("Error: No access_token in response")
    else:
        print(f"Login Failed: {status} {body}")

if __name__ == "__main__":
    verify_auth()
