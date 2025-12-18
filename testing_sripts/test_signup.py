import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

# Test Signup
print("Testing Signup...")
signup_data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "student"
}

req = urllib.request.Request(
    f"{BASE_URL}/users/signup",
    data=json.dumps(signup_data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print("Signup Success:", response.status)
        print(json.loads(response.read().decode('utf-8')))
except urllib.error.HTTPError as e:
    print(f"Signup Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Exception: {e}")
