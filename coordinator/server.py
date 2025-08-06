import os
import json
import sqlite3
import asyncio
import threading
import functools
import aiohttp
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cachetools import TTLCache
import uvicorn
from contextlib import asynccontextmanager

# GPT-OSS-20B Configuration (Primary Model)
GPT_OSS_API_KEY = os.getenv("GPT_OSS_API_KEY", "your-gpt-oss-api-key")
GPT_OSS_API_URL = "https://api.openai.com/v1/chat/completions"  # Adjust URL as needed
GPT_OSS_MODEL = "gpt-oss-20b"

# Other API configurations
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "your-openrouter-api-key")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Current AI provider and model (GPT-OSS-20B as primary)
CURRENT_PROVIDER = "gpt_oss"  # "gpt_oss", "auto", "gemini", "openrouter", or "groq"
CURRENT_MODEL = GPT_OSS_MODEL

# Auto mode configuration with GPT-OSS-20B as primary
AUTO_MODE_ENABLED = True
MODEL_SELECTION_RULES = {
    "coding": {
        "models": [GPT_OSS_MODEL, "llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemini-1.5-flash", "claude-3.5-sonnet"],
        "priority": [GPT_OSS_MODEL, "llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemini-1.5-flash", "claude-3.5-sonnet"],
        "providers": ["gpt_oss", "groq", "groq", "groq", "gemini", "openrouter"],
        "description": "Best for programming, algorithms, debugging, and technical tasks"
    },
    "creative": {
        "models": [GPT_OSS_MODEL, "claude-3.5-sonnet", "gemini-1.5-flash", "llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"],
        "priority": [GPT_OSS_MODEL, "claude-3.5-sonnet", "gemini-1.5-flash", "llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"],
        "providers": ["gpt_oss", "openrouter", "gemini", "groq", "groq", "groq"],
        "description": "Best for writing, storytelling, creative content, and artistic tasks"
    },
    "analysis": {
        "models": [GPT_OSS_MODEL, "claude-3.5-sonnet", "llama3-70b-8192", "gemini-1.5-flash", "llama3-8b-8192", "mixtral-8x7b-32768"],
        "priority": [GPT_OSS_MODEL, "claude-3.5-sonnet", "llama3-70b-8192", "gemini-1.5-flash", "llama3-8b-8192", "mixtral-8x7b-32768"],
        "providers": ["gpt_oss", "openrouter", "groq", "gemini", "groq", "groq"],
        "description": "Best for research, data analysis, evaluation, and complex reasoning"
    },
    "fast": {
        "models": [GPT_OSS_MODEL, "llama3-8b-8192", "gemini-1.5-flash", "mixtral-8x7b-32768", "llama3-70b-8192", "claude-3.5-sonnet"],
        "priority": [GPT_OSS_MODEL, "llama3-8b-8192", "gemini-1.5-flash", "mixtral-8x7b-32768", "llama3-70b-8192", "claude-3.5-sonnet"],
        "providers": ["gpt_oss", "groq", "gemini", "groq", "groq", "openrouter"],
        "description": "Best for quick answers, summaries, and simple queries"
    },
    "default": {
        "models": [GPT_OSS_MODEL, "llama3-8b-8192", "gemini-1.5-flash", "claude-3.5-sonnet", "llama3-70b-8192", "mixtral-8x7b-32768"],
        "priority": [GPT_OSS_MODEL, "llama3-8b-8192", "gemini-1.5-flash", "claude-3.5-sonnet", "llama3-70b-8192", "mixtral-8x7b-32768"],
        "providers": ["gpt_oss", "groq", "gemini", "openrouter", "groq", "groq"],
        "description": "Balanced selection for general tasks"
    }
}

# Use a local workspace directory instead of /workspace
WORK_DIR = "./workspace"
os.makedirs(WORK_DIR, exist_ok=True)

# Database setup
DB_PATH = "./chat.db"

# Performance optimizations
CACHE_TTL = 300  # 5 minutes
team_cache = TTLCache(maxsize=100, ttl=CACHE_TTL)
files_cache = TTLCache(maxsize=100, ttl=CACHE_TTL)
quotas_cache = TTLCache(maxsize=50, ttl=CACHE_TTL)

# Connection pool for database
db_connections = {}
db_lock = threading.Lock()

def get_db_connection():
    """Get database connection with connection pooling"""
    thread_id = threading.get_ident()
    
    with db_lock:
        if thread_id not in db_connections:
            try:
                db_connections[thread_id] = sqlite3.connect(DB_PATH)
                db_connections[thread_id].row_factory = sqlite3.Row
            except Exception as e:
                print(f"Error creating database connection: {e}")
                db_connections[thread_id] = sqlite3.connect(DB_PATH)
                db_connections[thread_id].row_factory = sqlite3.Row
        
        try:
            db_connections[thread_id].execute("SELECT 1")
        except (sqlite3.OperationalError, sqlite3.ProgrammingError):
            try:
                db_connections[thread_id].close()
            except:
                pass
            db_connections[thread_id] = sqlite3.connect(DB_PATH)
            db_connections[thread_id].row_factory = sqlite3.Row
            
        return db_connections[thread_id]

def close_db_connections():
    """Close all database connections"""
    with db_lock:
        for conn in db_connections.values():
            conn.close()
        db_connections.clear()

# Cache decorator
def cache_result(cache_dict, key_func=None):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = key_func(*args, **kwargs) if key_func else str(args) + str(kwargs)
            if key in cache_dict:
                return cache_dict[key]
            result = func(*args, **kwargs)
            cache_dict[key] = result
            return result
        return wrapper
    return decorator

# Task analysis function
def analyze_user_command(prompt: str) -> str:
    """Analyze user command to determine task type"""
    prompt_lower = prompt.lower()
    
    # Coding tasks
    coding_keywords = ['code', 'program', 'function', 'class', 'algorithm', 'debug', 'error', 'bug', 'implementation', 'development', 'software', 'app', 'api', 'database', 'sql', 'javascript', 'python', 'react', 'node', 'html', 'css']
    if any(keyword in prompt_lower for keyword in coding_keywords):
        return "coding"
    
    # Creative tasks
    creative_keywords = ['write', 'story', 'creative', 'art', 'design', 'poem', 'song', 'narrative', 'fiction', 'imagine', 'create', 'draw', 'paint', 'compose']
    if any(keyword in prompt_lower for keyword in creative_keywords):
        return "creative"
    
    # Analysis tasks
    analysis_keywords = ['analyze', 'research', 'study', 'examine', 'investigate', 'evaluate', 'compare', 'contrast', 'review', 'assessment', 'analysis', 'data', 'statistics', 'report']
    if any(keyword in prompt_lower for keyword in analysis_keywords):
        return "analysis"
    
    # Fast tasks (simple queries)
    fast_keywords = ['quick', 'simple', 'brief', 'summary', 'short', 'fast', 'quick answer', 'yes/no', 'what is', 'how to']
    if any(keyword in prompt_lower for keyword in fast_keywords):
        return "fast"
    
    return "default"

def get_best_model_for_task(prompt: str) -> tuple[str, str]:
    """Get the best model for a given task"""
    task_type = analyze_user_command(prompt)
    
    if task_type in MODEL_SELECTION_RULES:
        rule = MODEL_SELECTION_RULES[task_type]
        models = rule["models"]
        providers = rule["providers"]
        
        # Try each model in priority order
        for i, model in enumerate(models):
            provider = providers[i]
            if check_model_availability(provider, model):
                return provider, model
    
    # Fallback to GPT-OSS-20B
    return "gpt_oss", GPT_OSS_MODEL

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# HTTP session management
http_session = None

async def get_http_session():
    global http_session
    if http_session is None:
        http_session = aiohttp.ClientSession()
    return http_session

async def close_http_session():
    global http_session
    if http_session:
        await http_session.close()
        http_session = None

# Database initialization
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            avatar TEXT DEFAULT '👤',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_working BOOLEAN DEFAULT FALSE,
            message_type TEXT DEFAULT 'user',
            steps_remaining INTEGER DEFAULT 0,
            is_error BOOLEAN DEFAULT FALSE,
            error_type TEXT
        )
    ''')
    
    # Create team members table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS team_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            avatar TEXT DEFAULT '👤',
            active BOOLEAN DEFAULT FALSE,
            is_thinking BOOLEAN DEFAULT FALSE,
            steps_remaining INTEGER DEFAULT 0
        )
    ''')
    
    # Create API usage tracking table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT NOT NULL,
            model TEXT NOT NULL,
            daily_used INTEGER DEFAULT 0,
            daily_limit INTEGER DEFAULT 100,
            monthly_used INTEGER DEFAULT 0,
            monthly_limit INTEGER DEFAULT 1000,
            last_used DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default team members
    cursor.execute('''
        INSERT OR IGNORE INTO team_members (name, role, avatar, active) VALUES
        ('Alice', 'Frontend Developer', '👩‍💻', TRUE),
        ('Bob', 'Backend Developer', '👨‍💻', TRUE),
        ('Charlie', 'DevOps Engineer', '👨‍🔧', TRUE),
        ('Diana', 'UI/UX Designer', '👩‍🎨', TRUE),
        ('Eve', 'Product Manager', '👩‍💼', TRUE)
    ''')
    
    # Initialize API usage for GPT-OSS-20B
    cursor.execute('''
        INSERT OR IGNORE INTO api_usage (provider, model, daily_limit, monthly_limit) VALUES
        ('gpt_oss', ?, 100, 1000)
    ''', (GPT_OSS_MODEL,))
    
    conn.commit()

# Pydantic models
class ChatMessage(BaseModel):
    sender: str
    message: str
    avatar: str = "👤"
    is_working: bool = False
    message_type: str = "user"
    steps_remaining: int = 0
    is_error: bool = False
    error_type: Optional[str] = None

class TeamMember(BaseModel):
    id: int
    name: str
    role: str
    avatar: str
    active: bool = False
    is_thinking: bool = False
    steps_remaining: int = 0

class FileItem(BaseModel):
    name: str
    type: str
    icon: str
    content: Optional[str] = None
    path: Optional[str] = None

class Credits(BaseModel):
    daily: Dict[str, int]
    total: Dict[str, int]

# Database functions
def save_message(sender: str, message: str, avatar: str = "👤", is_working: bool = False, message_type: str = "user", steps_remaining: int = 0, is_error: bool = False, error_type: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (sender, message, avatar, is_working, message_type, steps_remaining, is_error, error_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (sender, message, avatar, is_working, message_type, steps_remaining, is_error, error_type))
    conn.commit()

def get_messages(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM messages 
        ORDER BY timestamp DESC 
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@cache_result(team_cache)
def get_team_members_optimized():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM team_members')
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@cache_result(files_cache)
def get_files_optimized():
    files = []
    try:
        for root, dirs, filenames in os.walk(WORK_DIR):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                relative_path = os.path.relpath(file_path, WORK_DIR)
                file_type = get_file_type_from_name(filename)
                icon = get_file_icon_from_type(file_type)
                
                files.append({
                    "name": filename,
                    "type": file_type,
                    "icon": icon,
                    "path": relative_path
                })
    except Exception as e:
        print(f"Error reading files: {e}")
    
    return files

def get_file_content(filename: str):
    try:
        file_path = os.path.join(WORK_DIR, filename)
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        return None
    except Exception as e:
        print(f"Error reading file {filename}: {e}")
        return None

def get_credits():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM api_usage')
    rows = cursor.fetchall()
    
    credits = {}
    for row in rows:
        provider = row['provider']
        model = row['model']
        daily_used = row['daily_used']
        daily_limit = row['daily_limit']
        monthly_used = row['monthly_used']
        monthly_limit = row['monthly_limit']
        
        if provider not in credits:
            credits[provider] = {}
        
        credits[provider][model] = {
            "daily": {
                "used": daily_used,
                "limit": daily_limit,
                "percentage": (daily_used / daily_limit * 100) if daily_limit > 0 else 0
            },
            "monthly": {
                "used": monthly_used,
                "limit": monthly_limit,
                "percentage": (monthly_used / monthly_limit * 100) if monthly_limit > 0 else 0
            },
            "last_used": row['last_used']
        }
    
    return credits

def check_quota():
    """Check if we have quota available for the current model"""
    credits = get_credits()
    if CURRENT_PROVIDER in credits and CURRENT_MODEL in credits[CURRENT_PROVIDER]:
        model_credits = credits[CURRENT_PROVIDER][CURRENT_MODEL]
        daily_percentage = model_credits["daily"]["percentage"]
        monthly_percentage = model_credits["monthly"]["percentage"]
        
        if daily_percentage >= 100 or monthly_percentage >= 100:
            return False
    return True

# GPT-OSS-20B API call function
async def call_gpt_oss_api(prompt: str, agent_role: str = "Assistant", model: str = None) -> str:
    """Call GPT-OSS-20B API"""
    if not GPT_OSS_API_KEY or GPT_OSS_API_KEY == "your-gpt-oss-api-key":
        raise Exception("GPT-OSS API key not configured")
    
    session = await get_http_session()
    
    headers = {
        "Authorization": f"Bearer {GPT_OSS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model or GPT_OSS_MODEL,
        "messages": [
            {"role": "system", "content": f"You are {agent_role}. Provide helpful, accurate, and detailed responses."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.7
    }
    
    try:
        async with session.post(GPT_OSS_API_URL, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                content = result["choices"][0]["message"]["content"]
                increment_api_usage("gpt_oss", model or GPT_OSS_MODEL)
                return content
            else:
                error_text = await response.text()
                raise Exception(f"GPT-OSS API error: {response.status} - {error_text}")
    except Exception as e:
        print(f"GPT-OSS API call failed: {e}")
        raise e

# Other API call functions
async def call_gemini_api(prompt: str, agent_role: str = "Assistant", model: str = None) -> str:
    """Call Gemini API"""
    session = await get_http_session()
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [{
            "parts": [{"text": f"You are {agent_role}. Provide helpful, accurate, and detailed responses.\n\nUser: {prompt}"}]
        }],
        "generationConfig": {
            "maxOutputTokens": 2000,
            "temperature": 0.7
        }
    }
    
    try:
        async with session.post(GEMINI_API_URL, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                increment_api_usage("gemini", model or "gemini-1.5-flash")
                return content
            else:
                error_text = await response.text()
                raise Exception(f"Gemini API error: {response.status} - {error_text}")
    except Exception as e:
        print(f"Gemini API call failed: {e}")
        raise e

async def call_openrouter_api(prompt: str, agent_role: str = "Assistant", model: str = None) -> str:
    """Call OpenRouter API"""
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your-openrouter-api-key":
        raise Exception("OpenRouter API key not configured")
    
    session = await get_http_session()
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model or "claude-3.5-sonnet",
        "messages": [
            {"role": "system", "content": f"You are {agent_role}. Provide helpful, accurate, and detailed responses."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.7
    }
    
    try:
        async with session.post(OPENROUTER_API_URL, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                content = result["choices"][0]["message"]["content"]
                increment_api_usage("openrouter", model or "claude-3.5-sonnet")
                return content
            else:
                error_text = await response.text()
                raise Exception(f"OpenRouter API error: {response.status} - {error_text}")
    except Exception as e:
        print(f"OpenRouter API call failed: {e}")
        raise e

async def call_groq_api(prompt: str, agent_role: str = "Assistant", model: str = None) -> str:
    """Call Groq API"""
    if not GROQ_API_KEY or GROQ_API_KEY == "your-groq-api-key":
        raise Exception("Groq API key not configured")
    
    session = await get_http_session()
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model or "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": f"You are {agent_role}. Provide helpful, accurate, and detailed responses."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.7
    }
    
    try:
        async with session.post(GROQ_API_URL, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                content = result["choices"][0]["message"]["content"]
                increment_api_usage("groq", model or "llama3-8b-8192")
                return content
            else:
                error_text = await response.text()
                raise Exception(f"Groq API error: {response.status} - {error_text}")
    except Exception as e:
        print(f"Groq API call failed: {e}")
        raise e

def check_model_availability(provider: str, model: str) -> bool:
    """Check if a model is available (simplified check)"""
    # For now, assume all models are available
    # In a real implementation, you would check quotas, API status, etc.
    return True

# Main AI API call function
async def call_ai_api(prompt: str, agent_role: str = "Assistant", agent_name: Optional[str] = None) -> tuple[str, str, str]:
    """Main function to call AI APIs with fallback logic"""
    
    # Check quota first
    if not check_quota():
        raise Exception("API quota limit reached for the current model")
    
    # Try GPT-OSS-20B first (primary model)
    try:
        response = await call_gpt_oss_api(prompt, agent_role, GPT_OSS_MODEL)
        return response, "gpt_oss", GPT_OSS_MODEL
    except Exception as e:
        print(f"GPT-OSS-20B failed: {e}")
        
        # Fallback to auto mode
        if AUTO_MODE_ENABLED:
            try:
                provider, model = get_best_model_for_task(prompt)
                if provider == "gpt_oss":
                    # Try other models
                    for fallback_provider, fallback_model in [("groq", "llama3-8b-8192"), ("gemini", "gemini-1.5-flash"), ("openrouter", "claude-3.5-sonnet")]:
                        try:
                            if fallback_provider == "groq":
                                response = await call_groq_api(prompt, agent_role, fallback_model)
                                return response, fallback_provider, fallback_model
                            elif fallback_provider == "gemini":
                                response = await call_gemini_api(prompt, agent_role, fallback_model)
                                return response, fallback_provider, fallback_model
                            elif fallback_provider == "openrouter":
                                response = await call_openrouter_api(prompt, agent_role, fallback_model)
                                return response, fallback_provider, fallback_model
                        except Exception as fallback_error:
                            print(f"Fallback {fallback_provider} failed: {fallback_error}")
                            continue
            except Exception as auto_error:
                print(f"Auto mode failed: {auto_error}")
        
        # Final fallback
        raise Exception(f"All AI providers failed. Last error: {e}")

# API usage tracking
def increment_api_usage(provider: str, model: str):
    """Increment API usage for a provider and model"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get current date
    today = datetime.now().strftime('%Y-%m-%d')
    current_month = datetime.now().strftime('%Y-%m')
    
    # Update or insert usage
    cursor.execute('''
        INSERT OR REPLACE INTO api_usage (provider, model, daily_used, monthly_used, last_used)
        VALUES (
            ?, ?, 
            COALESCE((SELECT daily_used FROM api_usage WHERE provider = ? AND model = ?), 0) + 1,
            COALESCE((SELECT monthly_used FROM api_usage WHERE provider = ? AND model = ?), 0) + 1,
            CURRENT_TIMESTAMP
        )
    ''', (provider, model, provider, model, provider, model))
    
    conn.commit()

# File processing functions
def extract_and_create_files(ai_response: str) -> list:
    """Extract file content from AI response and create files"""
    files_created = []
    
    # Look for code blocks with file names
    import re
    code_blocks = re.findall(r'```(\w+):([^\n]+)\n(.*?)```', ai_response, re.DOTALL)
    
    for file_type, filename, content in code_blocks:
        try:
            file_path = os.path.join(WORK_DIR, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content.strip())
            
            files_created.append({
                "name": filename,
                "type": file_type,
                "path": file_path
            })
        except Exception as e:
            print(f"Error creating file {filename}: {e}")
    
    return files_created

def get_file_type_from_name(filename: str) -> str:
    """Get file type from filename"""
    ext = os.path.splitext(filename)[1].lower()
    
    file_types = {
        '.py': 'python',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.html': 'html',
        '.css': 'css',
        '.json': 'json',
        '.md': 'markdown',
        '.txt': 'text',
        '.sql': 'sql',
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml'
    }
    
    return file_types.get(ext, 'unknown')

def get_file_icon_from_type(file_type: str) -> str:
    """Get file icon from file type"""
    icons = {
        'python': '🐍',
        'javascript': '📜',
        'typescript': '📘',
        'html': '🌐',
        'css': '🎨',
        'json': '📄',
        'markdown': '📝',
        'text': '📄',
        'sql': '🗄️',
        'xml': '📋',
        'yaml': '⚙️',
        'unknown': '📄'
    }
    
    return icons.get(file_type, '📄')

# FastAPI app setup
app = FastAPI(title="Sumeru AI Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("🚀 Sumeru AI Platform started")
    yield
    # Shutdown
    await close_http_session()
    close_db_connections()
    print("🛑 Sumeru AI Platform stopped")

app = FastAPI(lifespan=lifespan)

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    error_id = str(uuid.uuid4())
    print(f"HTTP Exception caught: {exc.status_code} - {exc.detail} (ID: {error_id})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": f"{exc.status_code}: {exc.detail}",
            "message": exc.detail,
            "help": "Please check your request and try again.",
            "suggestions": ["Verify input data", "Check API documentation"],
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat(),
            "error_id": error_id,
            "error_type": exc.detail
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_id = str(uuid.uuid4())
    print(f"Global Exception caught: {type(exc).__name__} - {str(exc)} (ID: {error_id})")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "help": "Please try again later or contact support.",
            "suggestions": ["Refresh the page", "Check your connection", "Try again in a few minutes"],
            "status_code": 500,
            "timestamp": datetime.now().isoformat(),
            "error_id": error_id,
            "error_type": type(exc).__name__
        }
    )

# API endpoints
@app.get("/")
async def root():
    return {"message": "Sumeru AI Platform API", "version": "1.0.0", "primary_model": GPT_OSS_MODEL}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "primary_model": GPT_OSS_MODEL}

@app.get("/api/chat/messages")
async def get_chat_messages():
    messages = get_messages()
    return {"messages": messages}

@app.post("/api/chat/send")
async def send_chat_message(request: Request):
    try:
        data = await request.json()
        message = data.get("message", "").strip()
        
        if not message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if len(message) > 2000:
            raise HTTPException(status_code=400, detail="Message too long (max 2000 characters)")
        
        # Save user message
        save_message("User", message, "👤", False, "user")
        
        # Get AI response
        try:
            response, provider, model = await call_ai_api(message)
            
            # Extract and create files if any
            files_created = extract_and_create_files(response)
            
            # Save AI response
            save_message("AI Assistant", response, "🤖", False, "assistant")
            
            return {
                "success": True,
                "response": response,
                "provider": provider,
                "model": model,
                "files_created": files_created
            }
            
        except Exception as ai_error:
            error_message = f"AI service error: {str(ai_error)}"
            save_message("System", error_message, "⚠️", False, "system", 0, True, "ai_error")
            raise HTTPException(status_code=500, detail=error_message)
            
    except HTTPException:
        raise
    except Exception as e:
        error_message = f"Server error: {str(e)}"
        save_message("System", error_message, "⚠️", False, "system", 0, True, "server_error")
        raise HTTPException(status_code=500, detail=error_message)

@app.get("/api/team")
async def get_team_members_endpoint():
    members = get_team_members_optimized()
    return {"members": members}

@app.get("/api/files")
async def get_files_endpoint():
    files = get_files_optimized()
    return {"files": files}

@app.get("/api/files/{filename}")
async def get_file_content_endpoint(filename: str):
    content = get_file_content(filename)
    if content is None:
        raise HTTPException(status_code=404, detail="File not found")
    return {"filename": filename, "content": content}

@app.get("/api/credits")
async def get_credits_endpoint():
    credits = get_credits()
    return {"credits": credits}

@app.get("/api/quotas")
async def get_quotas_endpoint():
    quotas = get_credits()
    return quotas

@app.get("/api/model")
async def get_current_model():
    return {
        "model": "GPT-OSS-20B",
        "provider": "GPT-OSS",
        "provider_code": "gpt_oss",
        "is_primary": True
    }

@app.post("/api/model")
async def change_model(model_request: dict):
    provider = model_request.get("provider")
    model = model_request.get("model")
    
    if not provider or not model:
        raise HTTPException(status_code=400, detail="Provider and model are required")
    
    # Update current model
    global CURRENT_PROVIDER, CURRENT_MODEL
    CURRENT_PROVIDER = provider
    CURRENT_MODEL = model
    
    return {
        "status": "success",
        "model": model,
        "provider": provider,
        "message": f"Model changed to {model} ({provider})"
    }

@app.get("/api/models/available")
async def get_available_models():
    return {
        "auto_mode": {
            "enabled": AUTO_MODE_ENABLED,
            "categories": MODEL_SELECTION_RULES
        },
        "providers": {
            "gpt_oss": {
                "name": "GPT-OSS",
                "description": "Open Source GPT model with 20B parameters",
                "models": [GPT_OSS_MODEL]
            },
            "groq": {
                "name": "Groq",
                "description": "Fast inference API",
                "models": ["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]
            },
            "gemini": {
                "name": "Google AI Studio",
                "description": "Google's AI models",
                "models": ["gemini-1.5-flash", "gemini-1.5-pro"]
            },
            "openrouter": {
                "name": "OpenRouter",
                "description": "Multiple AI providers",
                "models": ["claude-3.5-sonnet", "gpt-4-turbo", "gpt-4o", "claude-3-haiku"]
            }
        }
    }

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Message: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 