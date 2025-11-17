#!/bin/bash

# Convergent Project Startup Script

echo "🚀 Starting Convergent Project..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start MongoDB and Redis
echo "📦 Starting MongoDB and Redis containers..."
docker start convergent-mongodb convergent-redis 2>/dev/null || {
    echo "Creating MongoDB container..."
    docker run -d -p 27017:27017 --name convergent-mongodb \
      -e MONGO_INITDB_ROOT_USERNAME=convergent_user \
      -e MONGO_INITDB_ROOT_PASSWORD=convergent_password \
      -e MONGO_INITDB_DATABASE=convergent_db \
      mongo:7.0
    
    echo "Creating Redis container..."
    docker run -d -p 6379:6379 --name convergent-redis redis:7-alpine
}

echo "✅ MongoDB and Redis are running"
echo ""

# Check if server dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Check if client dependencies are installed
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "🎯 Starting services..."
echo ""

# Start server in background
echo "🔧 Starting server on port 3001..."
cd server
npm run dev > ../server.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait a bit for server to start
sleep 3

# Start client
echo "📱 Starting client (Expo)..."
cd client
npm start &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Server: http://localhost:3001"
echo "📱 Client: Expo dev server (check terminal for QR code)"
echo ""
echo "To stop services, run: ./stop.sh"
echo "Or manually kill processes: kill $SERVER_PID $CLIENT_PID"

# Save PIDs to file for stop script
echo "$SERVER_PID $CLIENT_PID" > .pids



