#!/bin/bash

# Quick Docs Deploy Script
# For rapid documentation updates
#
# 🚨 CRITICAL: This script follows the Yirra deployment pattern
# - Uses existing deployment pattern (single container, port 4000)
# - Only updates the Docker image tag, never networking
# - Maintains nginx.conf listen 4000 configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📚 Quick Docs Deploy${NC}"

# Configuration
NAMESPACE="drone-store"
REGISTRY="localhost:5000"
VERSION="docs-$(date +%H%M%S)"

# Build Docusaurus site
echo -e "${YELLOW}📦 Building Docusaurus site...${NC}"
npm run build

if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build failed - no build directory found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Get Clerk key from Kubernetes secret
echo -e "${YELLOW}🔑 Getting Clerk key...${NC}"
CLERK_KEY=$(k3s kubectl get secret clerk-secrets -n "$NAMESPACE" -o jsonpath='{.data.CLERK_PUBLISHABLE_KEY}' | base64 --decode)
if [ -z "$CLERK_KEY" ]; then
    echo -e "${RED}❌ Failed to get Clerk key from secret${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Clerk key obtained${NC}"

# Build and push Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker build --build-arg CLERK_PUBLISHABLE_KEY="$CLERK_KEY" -t "yirra-docs:$VERSION" .
docker tag "yirra-docs:$VERSION" "$REGISTRY/yirra-docs:$VERSION"
docker tag "yirra-docs:$VERSION" "$REGISTRY/yirra-docs:latest"

echo -e "${YELLOW}🔌 Setting up registry port-forward...${NC}"
k3s kubectl port-forward service/registry 5000:5000 -n "$NAMESPACE" > /dev/null 2>&1 &
PORT_FORWARD_PID=$!
sleep 3 # Give it a moment to establish the connection

# Setup a trap to kill the port-forward process on script exit
trap 'echo "🛑 Stopping port-forward..."; kill $PORT_FORWARD_PID &> /dev/null' EXIT

echo -e "${YELLOW}📤 Pushing image...${NC}"
if ! docker push "$REGISTRY/yirra-docs:$VERSION"; then
    echo -e "${RED}❌ Failed to push image to registry${NC}"
    exit 1
fi

if ! docker push "$REGISTRY/yirra-docs:latest"; then
    echo -e "${RED}❌ Failed to push latest tag to registry${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Images pushed successfully${NC}"

# Manually kill the port-forward process and remove the trap for a clean exit
kill $PORT_FORWARD_PID
trap - EXIT

# Check if deployment exists
if k3s kubectl get deployment docs -n "$NAMESPACE" &> /dev/null; then
    # Update existing deployment
    echo -e "${YELLOW}🚀 Updating Kubernetes deployment...${NC}"
    K8S_REGISTRY="localhost:5000"
    k3s kubectl set image deployment/docs docs="$K8S_REGISTRY/yirra-docs:$VERSION" -n "$NAMESPACE"
    
    # Wait for rollout
    echo -e "${YELLOW}⏳ Waiting for deployment...${NC}"
    k3s kubectl rollout status deployment/docs -n "$NAMESPACE" --timeout=120s
else
    # Create new deployment
    echo -e "${YELLOW}🚀 Creating new Kubernetes deployment...${NC}"
    k3s kubectl apply -f k8s-deployment.yaml
    k3s kubectl apply -f k8s-ingress.yaml
    
    # Wait for deployment
    echo -e "${YELLOW}⏳ Waiting for deployment...${NC}"
    k3s kubectl rollout status deployment/docs -n "$NAMESPACE" --timeout=120s
fi

echo -e "${GREEN}✅ Docs site deployed successfully! (${VERSION})${NC}"

# Run Docker garbage collection to prevent disk pressure
echo -e "${YELLOW}🧹 Running Docker garbage collection...${NC}"
if [ -f "../drone_website_MAX/scripts/docker-gc.sh" ]; then
    ../drone_website_MAX/scripts/docker-gc.sh
else
    echo -e "${YELLOW}⚠️  Docker GC script not found, skipping cleanup${NC}"
fi

# Show current pods
echo -e "${BLUE}Current docs pods:${NC}"
k3s kubectl get pods -n "$NAMESPACE" -l app=docs

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}📄 Access the docs at: https://yirrasystems.com/docs${NC}"


