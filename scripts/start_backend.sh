#!/bin/bash

# InstantSite Backend Startup Script

echo "🚀 Starting InstantSite Backend..."

# Check if we're in the correct directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: This script must be run from the backend directory"
    echo "Current directory: $(pwd)"
    echo "Please cd to the backend directory and try again"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file based on env.example"
    echo "The server will start with default values, but Firebase won't work without proper configuration."
    echo ""
    echo "To create .env file:"
    echo "cp env.example .env"
    echo "# Then edit .env with your Firebase credentials"
    echo ""
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p clones
mkdir -p static

# Check Docker connection
echo "🐳 Checking Docker connection..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running or not accessible"
    echo "Please start Docker and ensure your user has permission to access Docker"
    echo "On Linux, you may need to add your user to the docker group:"
    echo "sudo usermod -aG docker $USER"
    echo "Then log out and log back in."
    exit 1
else
    echo "✅ Docker connection OK"
fi

# Start the server
echo "🌟 Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload 