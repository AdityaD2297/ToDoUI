#!/bin/bash

# ToDoUI Deployment Script
echo "🚀 Starting ToDoUI Deployment..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t todoui:latest .

# Tag for deployment (update with your registry)
echo "🏷️ Tagging image..."
docker tag todoui:latest your-registry/todoui:latest

# Push to registry (uncomment and update with your registry)
# echo "📤 Pushing to registry..."
# docker push your-registry/todoui:latest

echo "✅ Build completed successfully!"
echo "🌐 Remember to update your production environment variables:"
echo "   - VITE_API_BASE_URL=https://todoapi-tcbd.onrender.com"
echo "   - Any other required environment variables"
