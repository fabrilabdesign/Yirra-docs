#!/bin/bash
# Quick rebuild and deploy script for admin panel

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Admin Panel Rebuild & Deploy ===${NC}\n"

# Get the Clerk key
CLERK_KEY='pk_live_Y2xlcmsueWlycmFzeXN0ZW1zLmNvbSQ'

# Increment version
CURRENT_VERSION=$(docker images localhost:5000/admin-panel --format "{{.Tag}}" | grep -E '^v[0-9]+$' | sed 's/v//' | sort -n | tail -1)
if [ -z "$CURRENT_VERSION" ]; then
    CURRENT_VERSION=0
fi
NEW_VERSION=$((CURRENT_VERSION + 1))

echo -e "${YELLOW}Building version: v${NEW_VERSION}${NC}"

# Build
cd /home/james/yirra_systems_app/admin-panel
docker build --build-arg VITE_CLERK_PUBLISHABLE_KEY="${CLERK_KEY}" \
  -t localhost:5000/admin-panel:v${NEW_VERSION} \
  -t localhost:5000/admin-panel:latest .

echo -e "\n${GREEN}✓ Build complete${NC}"

# Push
echo -e "\n${YELLOW}Pushing to registry...${NC}"
docker push localhost:5000/admin-panel:v${NEW_VERSION}
docker push localhost:5000/admin-panel:latest

echo -e "${GREEN}✓ Push complete${NC}"

# Deploy
echo -e "\n${YELLOW}Deploying to Kubernetes...${NC}"
k3s kubectl set image deployment/admin-frontend \
  admin-frontend=localhost:5000/admin-panel:v${NEW_VERSION} \
  -n drone-store

echo -e "${GREEN}✓ Deployment updated${NC}"

# Wait for rollout
echo -e "\n${YELLOW}Waiting for rollout to complete...${NC}"
k3s kubectl rollout status deployment/admin-frontend -n drone-store --timeout=120s

echo -e "\n${GREEN}✓ Rollout complete!${NC}"

# Show status
echo -e "\n${BLUE}=== Current Status ===${NC}"
k3s kubectl get pods -n drone-store | grep admin-frontend

echo -e "\n${GREEN}✓ Admin panel v${NEW_VERSION} deployed successfully!${NC}"
echo -e "${BLUE}URL: https://app.yirrasystems.com${NC}\n"


