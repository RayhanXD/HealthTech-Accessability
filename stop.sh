#!/bin/bash

# Convergent Project Stop Script

echo "🛑 Stopping Convergent Project..."
echo ""

# Stop processes if PIDs file exists
if [ -f .pids ]; then
    PIDS=$(cat .pids)
    echo "Stopping server and client processes..."
    kill $PIDS 2>/dev/null
    rm .pids
    echo "✅ Processes stopped"
fi

# Stop Docker containers
echo "Stopping MongoDB and Redis containers..."
docker stop convergent-mongodb convergent-redis 2>/dev/null
echo "✅ Containers stopped"

echo ""
echo "✅ All services stopped!"





