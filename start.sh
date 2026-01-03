#!/bin/bash

# MediTrack Quick Start Script

echo "🏥 MediTrack Setup & Start Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "  macOS: brew install node"
    echo "  Or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Please create a .env file with the following variables:"
    echo "  OPENAI_API_KEY=your_key_here"
    echo "  EMAIL_SERVICE=gmail"
    echo "  EMAIL_USER=your.email@gmail.com"
    echo "  EMAIL_PASS=your_app_password"
    echo ""
    exit 1
fi

echo "✅ .env file found"
echo ""

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
    echo ""
else
    echo "✅ Backend dependencies already installed"
    echo ""
fi

# Start backend server
echo "🚀 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

echo "✅ Backend server started (PID: $BACKEND_PID)"
echo ""

# Wait for backend to start
sleep 3

# Start frontend server
echo "🚀 Starting frontend server..."
cd frontend

# Try different methods to start HTTP server
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8000 &
    FRONTEND_PID=$!
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    python -m SimpleHTTPServer 8000 &
    FRONTEND_PID=$!
else
    echo "⚠️  Python not found. Please start frontend manually:"
    echo "  cd frontend && python3 -m http.server 8000"
    echo ""
fi

cd ..

echo ""
echo "=================================="
echo "✅ MediTrack is running!"
echo "=================================="
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:8000"
echo ""
echo "Open your browser to: http://localhost:8000"
echo ""
echo "To stop the servers:"
echo "  Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
