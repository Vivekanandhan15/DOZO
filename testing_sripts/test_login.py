import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

# Test Login
print("Testing Login...")
login_data = {
    "email": "test@example.com",
    "password": "password123"
}

req = urllib.request.Request(
    f"{BASE_URL}/auth/login",
    data=json.dumps(login_data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print("Login Success:", response.status)
        result = json.loads(response.read().decode('utf-8'))
        print("Token received:", result.get('access_token') is not None)
        print("Token type:", result.get('token_type'))
except urllib.error.HTTPError as e:
    print(f"Login Error: {e.code}")
    error_body = e.read().decode('utf-8')
    print("Error response:")
    print(error_body)
except Exception as e:
    print(f"Exception: {e}")
