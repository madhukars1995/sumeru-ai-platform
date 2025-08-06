#!/bin/bash

# Sumeru AI Development Script
# This script starts both backend and frontend with hot reloading

echo "🚀 Starting Sumeru AI Development Environment..."

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f uvicorn 2>/dev/null
pkill -f vite 2>/dev/null
sleep 2

# Start backend with hot reloading
echo "🔧 Starting Backend (FastAPI + Uvicorn)..."
cd coordinator
python3 -m uvicorn server:app --host 127.0.0.1 --port 8001 --reload --reload-dir . &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8001/api/model > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend with hot reloading
echo "🎨 Starting Frontend (Vite + React)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend is running
if curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:5174"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 Sumeru AI Development Environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:5174"
echo "🔧 Backend:  http://localhost:8001"
echo "📊 API Docs: http://localhost:8001/docs"
echo ""
echo "💡 Hot reloading is enabled for both frontend and backend!"
echo "   - Edit files in frontend/src/ and see changes instantly"
echo "   - Edit files in coordinator/ and see backend changes instantly"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f uvicorn 2>/dev/null
    pkill -f vite 2>/dev/null
    echo "✅ Development environment stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait 