#!/bin/bash

# Sumeru AI Development Startup Script
echo "🚀 Starting Sumeru AI Development Environment..."

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    pkill -f "python3 server.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "python3 server.py" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Wait a moment for processes to clean up
sleep 2

# Start the backend server
echo "🔧 Starting backend server (port 8001)..."
cd coordinator && python3 server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend server
echo "🎨 Starting frontend server (port 5174)..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:5174"
echo "🔧 Backend: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait 