#!/usr/bin/env python3
"""
Model Switching Script for Sumeru AI
Use this script to quickly switch between different models when quota issues occur.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8001"

def get_current_model():
    """Get the current model"""
    try:
        response = requests.get(f"{BASE_URL}/api/model")
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"❌ Failed to get current model: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting current model: {e}")
        return None

def get_available_models():
    """Get all available models"""
    try:
        response = requests.get(f"{BASE_URL}/api/models/available")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get available models: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting available models: {e}")
        return None

def switch_model(provider, model):
    """Switch to a specific model"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/model",
            headers={"Content-Type": "application/json"},
            json={"provider": provider, "model": model}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Successfully switched to: {data['model']} ({data['provider']})")
            return True
        else:
            print(f"❌ Failed to switch model: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error switching model: {e}")
        return False

def test_chat():
    """Test if the chat is working"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/chat/send",
            headers={"Content-Type": "application/json"},
            json={
                "message": "Hello, testing if this model works.",
                "sender": "test-user",
                "message_type": "user"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                print(f"✅ Chat is working! Response: {data['message'][:100]}...")
                return True
            else:
                print(f"❌ Chat failed: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ Chat test failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing chat: {e}")
        return False

def main():
    print("🤖 Sumeru AI Model Switcher")
    print("=" * 40)
    
    # Get current model
    current = get_current_model()
    if current:
        print(f"📊 Current Model: {current['model']} ({current['provider']})")
    
    # Get available models
    models = get_available_models()
    if not models:
        print("❌ Could not get available models")
        return
    
    print("\n🔄 Available Models:")
    print("-" * 40)
    
    # Show available models grouped by provider
    for provider_code, provider in models['providers'].items():
        print(f"\n📦 {provider['name']} - {provider['description']}")
        for model_name in provider['models']:
            print(f"   • {model_name}")
    
    print("\n🚀 Quick Model Switches (when quota issues occur):")
    print("-" * 40)
    
    # Define some reliable fallback models
    fallback_models = [
        ("openrouter", "claude-3-5-sonnet", "Claude 3.5 Sonnet (OpenRouter)"),
        ("openrouter", "gpt-4o", "GPT-4o (OpenRouter)"),
        ("openrouter", "claude-3-haiku", "Claude 3 Haiku (OpenRouter)"),
        ("gemini", "gemini-1-5-flash", "Gemini 1.5 Flash (Google)"),
        ("groq", "llama-4-scout-17b", "Llama 4 Scout 17B (Groq)"),
    ]
    
    for i, (provider, model, description) in enumerate(fallback_models, 1):
        print(f"{i}. {description}")
    
    print("\n💡 Usage:")
    print("   python3 switch_model.py <provider> <model>")
    print("   Example: python3 switch_model.py openrouter claude-3-5-sonnet")
    
    # If arguments provided, switch model
    if len(sys.argv) == 3:
        provider = sys.argv[1]
        model = sys.argv[2]
        
        print(f"\n🔄 Switching to {provider}:{model}...")
        if switch_model(provider, model):
            print("\n🧪 Testing chat...")
            if test_chat():
                print("✅ Model switch successful and chat is working!")
            else:
                print("⚠️  Model switched but chat test failed - may need different model")
        else:
            print("❌ Failed to switch model")
    else:
        print("\n💡 To switch models, run:")
        print("   python3 switch_model.py openrouter claude-3-5-sonnet")
        print("   python3 switch_model.py gemini gemini-1-5-flash")

if __name__ == "__main__":
    main() 