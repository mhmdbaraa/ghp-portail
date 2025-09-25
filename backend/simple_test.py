import requests

try:
    response = requests.get("http://localhost:8000/api/auth/permissions/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Found {len(data.get('results', data))} permissions")
        print("First permission:", data.get('results', data)[0] if data.get('results', data) else "None")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Connection error: {e}")
