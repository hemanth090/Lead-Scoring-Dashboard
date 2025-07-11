import requests
import json
import time

def test_api():
    """Test the Lead Scoring API endpoints."""
    
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
        print("Is the API running? Start it with 'uvicorn main:app --reload'")
        return
    
    # Test score endpoint
    print("\n2. Testing score endpoint...")
    lead_data = {
        "phone_number": "+91-9876543210",
        "email": "test@example.com",
        "credit_score": 750,
        "age_group": "36-50",
        "family_background": "Married with Kids",
        "income": 500000,
        "property_type": "House",
        "budget": 2500000,
        "location": "Suburban",
        "previous_inquiries": 2,
        "time_on_market": 15,
        "response_time_minutes": 30,
        "comments": "Looking for a house in suburban area. Ready to purchase immediately.",
        "consent": True
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{base_url}/score", json=lead_data)
        end_time = time.time()
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        print(f"API latency: {(end_time - start_time) * 1000:.2f} ms")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test leads endpoint
    print("\n3. Testing leads endpoint...")
    try:
        response = requests.get(f"{base_url}/leads")
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test leads stats endpoint
    print("\n4. Testing leads stats endpoint...")
    try:
        response = requests.get(f"{base_url}/leads/stats")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\nAPI tests completed.")

if __name__ == "__main__":
    test_api()