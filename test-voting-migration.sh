#!/bin/bash

# Test voting automation migration
echo "Testing voting automation migration..."

# Test 1: Start automation
echo "Test 1: Starting automation..."
START_RESPONSE=$(curl -s -X POST "https://magic-sauce.addiaire.com/ms/v1/automation/start" \
  -H "Content-Type: application/json" \
  -d '{"targetId":"t3_test123","targetType":"post","mode":"target","targetScore":10}')

echo "Start response: $START_RESPONSE"

# Check if response contains "ok": true
if echo "$START_RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Automation started successfully"
else
  echo "❌ Failed to start automation"
  exit 1
fi

# Test 2: Check status
echo "Test 2: Checking automation status..."
STATUS_RESPONSE=$(curl -s "https://magic-sauce.addiaire.com/ms/v1/automation/status/t3_test123")
echo "Status response: $STATUS_RESPONSE"

# Test 3: Stop automation
echo "Test 3: Stopping automation..."
STOP_RESPONSE=$(curl -s -X POST "https://magic-sauce.addiaire.com/ms/v1/automation/stop" \
  -H "Content-Type: application/json" \
  -d '{"targetId":"t3_test123"}')

echo "Stop response: $STOP_RESPONSE"

if echo "$STOP_RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Automation stopped successfully"
else
  echo "❌ Failed to stop automation"
fi

echo "✅ All tests completed!"
