import asyncio
import aiohttp
import json
import ssl

# API Configuration
GEMINI_API_KEY = "AIzaSyDzBKCrqflYlfYqp-rHxz1byIUtswL0x-Q"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

async def test_gemini_api():
    """Test Gemini API directly"""
    try:
        headers = {
            "Content-Type": "application/json",
        }
        
        data = {
            "contents": [
                {
                    "parts": [
                        {"text": "Write a simple Python function to calculate fibonacci numbers"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }
        
        # Create SSL context that doesn't verify certificates for development
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers=headers,
                json=data
            ) as response:
                print(f"Status: {response.status}")
                if response.status == 200:
                    result = await response.json()
                    print("Success! Response:")
                    print(json.dumps(result, indent=2))
                else:
                    error_text = await response.text()
                    print(f"Error: {error_text}")
                    
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini_api()) 