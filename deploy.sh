#!/bin/bash
# Docker Deployment Script for VPS

echo "🚀 Starting Docker deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Clean up old images (optional)
read -p "Do you want to clean up old Docker images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up Docker system..."
    docker system prune -f
fi

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose ps

# Initialize database if needed
print_status "Initializing database..."
docker-compose exec -T app npx prisma db push

# Show logs
print_status "Deployment completed! Showing logs..."
docker-compose logs --tail=50

print_status "Access the application at: http://localhost:3000"
print_status "Use 'docker-compose logs -f' to follow logs"