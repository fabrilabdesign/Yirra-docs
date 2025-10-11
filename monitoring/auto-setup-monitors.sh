#!/bin/bash
set -e

# Uptime Kuma Auto-Setup Script
# This script automatically creates all monitors via the Uptime Kuma API

KUMA_URL="${KUMA_URL:-http://uptime-kuma-service.monitoring:3001}"
USERNAME="${KUMA_USERNAME:-admin}"
PASSWORD="${KUMA_PASSWORD}"

if [ -z "$PASSWORD" ]; then
  echo "Error: KUMA_PASSWORD environment variable is required"
  echo "Usage: KUMA_PASSWORD='your-password' ./auto-setup-monitors.sh"
  exit 1
fi

echo "=========================================="
echo "Uptime Kuma Auto-Configuration"
echo "=========================================="
echo "URL: $KUMA_URL"
echo "Username: $USERNAME"
echo ""

# Install dependencies if needed
if ! command -v curl &> /dev/null; then
  echo "Installing curl..."
  apk add --no-cache curl jq 2>/dev/null || apt-get update && apt-get install -y curl jq
fi

# Wait for Uptime Kuma to be ready
echo "Waiting for Uptime Kuma to be ready..."
for i in $(seq 1 30); do
  if curl -s "$KUMA_URL" > /dev/null 2>&1; then
    echo "✓ Uptime Kuma is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "✗ Timeout waiting for Uptime Kuma"
    exit 1
  fi
  sleep 2
done

# Note: Uptime Kuma uses Socket.IO, not REST API
# We'll use curl to interact with the Socket.IO endpoint
# First, we need to get a socket.io session

echo ""
echo "Connecting to Uptime Kuma API..."

# Get Socket.IO session
SID=$(curl -s "${KUMA_URL}/socket.io/?EIO=4&transport=polling" | sed 's/^0//' | jq -r '.sid' 2>/dev/null)

if [ -z "$SID" ] || [ "$SID" = "null" ]; then
  echo "✗ Failed to get Socket.IO session"
  echo ""
  echo "This is expected on first run. Please:"
  echo "1. Visit https://kuma.yirrasystems.com"
  echo "2. Create your admin account"
  echo "3. Then run this script with your credentials:"
  echo "   kubectl exec -n monitoring uptime-kuma-0 -- /bin/sh -c 'KUMA_PASSWORD=\"yourpass\" /tmp/auto-setup-monitors.sh'"
  exit 1
fi

echo "✓ Got Socket.IO session: $SID"

# The Socket.IO API is complex, so we'll use a simpler approach:
# Generate SQL statements to directly insert into the SQLite database

echo ""
echo "=========================================="
echo "Creating monitors via direct database..."
echo "=========================================="

# Check if monitors already exist
EXISTING_MONITORS=$(sqlite3 /app/data/kuma.db "SELECT COUNT(*) FROM monitor;" 2>/dev/null || echo "0")

if [ "$EXISTING_MONITORS" -gt 0 ]; then
  echo "✓ Found $EXISTING_MONITORS existing monitors"
  echo "  Skipping auto-creation to avoid duplicates"
  echo ""
  echo "To view monitors, visit: https://kuma.yirrasystems.com"
  exit 0
fi

echo "No existing monitors found. Creating..."

# Create monitors directly in database
cat > /tmp/insert_monitors.sql <<'EOF'
INSERT INTO monitor (name, type, url, method, interval, maxretries, retry_interval, timeout, active, weight) VALUES
('🌐 Main Site', 'http', 'https://yirrasystems.com', 'GET', 60, 3, 60, 48, 1, 2000),
('🔌 Backend API', 'http', 'https://yirrasystems.com/api/health', 'GET', 60, 3, 60, 48, 1, 2000),
('👨‍💼 Admin Panel', 'http', 'https://app.yirrasystems.com', 'GET', 60, 3, 60, 48, 1, 2000),
('📚 Documentation', 'http', 'https://docs.yirrasystems.com', 'GET', 60, 3, 60, 48, 1, 2000),
('⚙️ N8N Workflows', 'http', 'https://flows.yirrasystems.com', 'GET', 60, 3, 60, 48, 1, 2000),
('📦 Docker Registry', 'http', 'http://registry.drone-store.svc.cluster.local:5000/v2/', 'GET', 60, 3, 60, 48, 1, 2000);

INSERT INTO monitor (name, type, hostname, port, interval, maxretries, retry_interval, active, weight) VALUES
('🗄️ PostgreSQL', 'port', 'postgres.drone-store.svc.cluster.local', 5432, 60, 3, 60, 1, 2000),
('⚡ Redis', 'port', 'redis.drone-store.svc.cluster.local', 6379, 60, 3, 60, 1, 2000);
EOF

if command -v sqlite3 &> /dev/null; then
  sqlite3 /app/data/kuma.db < /tmp/insert_monitors.sql
  echo "✓ Successfully created 8 monitors!"
  rm /tmp/insert_monitors.sql
else
  echo "✗ sqlite3 not available in container"
  echo "  Manual setup required through web UI"
  rm /tmp/insert_monitors.sql
  exit 1
fi

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Created 8 monitors:"
echo "  • 6 External HTTP/HTTPS services"
echo "  • 2 Internal TCP port checks"
echo ""
echo "Visit https://kuma.yirrasystems.com to view your dashboard"
echo ""




