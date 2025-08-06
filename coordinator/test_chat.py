#!/usr/bin/env python3

import requests
import json

def test_chat_post():
    """Test the chat POST endpoint"""
    url = "http://localhost:8001/api/chat/messages"
    
    # Test data
    data = {
        "sender": "Test User",
        "message": "Hello, this is a test message",
        "avatar": "🧪",
        "message_type": "user"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ POST request successful!")
        else:
            print("❌ POST request failed!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat_post() 