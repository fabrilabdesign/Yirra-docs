#!/bin/bash
set -e

# Uptime Kuma Setup Script
# This script configures Uptime Kuma with monitors for all services

KUMA_URL="http://uptime-kuma-service.monitoring:3001"
ADMIN_USER="admin"
ADMIN_PASS="YirraAdmin2025!"
TIMEOUT=60

echo "Waiting for Uptime Kuma to be ready..."
for i in $(seq 1 $TIMEOUT); do
  if curl -s "$KUMA_URL" > /dev/null 2>&1; then
    echo "Uptime Kuma is ready!"
    break
  fi
  if [ $i -eq $TIMEOUT ]; then
    echo "Timeout waiting for Uptime Kuma"
    exit 1
  fi
  sleep 2
done

# Check if setup is needed
NEED_SETUP=$(curl -s "$KUMA_URL/api/status-page/heartbeat/yirrasystems" 2>/dev/null || echo "need_setup")

if [[ "$NEED_SETUP" == *"need_setup"* ]] || [[ "$NEED_SETUP" == *"error"* ]]; then
  echo "Setting up admin account..."
  
  # Setup admin account via socket.io
  # Note: Uptime Kuma uses socket.io, so we'll create monitors via the web interface setup
  # For now, we'll create a default config file that can be imported
  
  cat > /tmp/kuma-setup.json <<'EOF'
{
  "monitors": [
    {
      "name": "Main Site (yirrasystems.com)",
      "type": "http",
      "url": "https://yirrasystems.com",
      "method": "GET",
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "timeout": 48,
      "active": true
    },
    {
      "name": "Backend API (yirrasystems.com/api)",
      "type": "http",
      "url": "https://yirrasystems.com/api/health",
      "method": "GET",
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "timeout": 48,
      "active": true
    },
    {
      "name": "Admin Panel (app.yirrasystems.com)",
      "type": "http",
      "url": "https://app.yirrasystems.com",
      "method": "GET",
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "timeout": 48,
      "active": true
    },
    {
      "name": "Documentation (docs.yirrasystems.com)",
      "type": "http",
      "url": "https://docs.yirrasystems.com",
      "method": "GET",
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "timeout": 48,
      "active": true
    },
    {
      "name": "N8N Workflows (flows.yirrasystems.com)",
      "type": "http",
      "url": "https://flows.yirrasystems.com",
      "method": "GET",
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "timeout": 48,
      "active": true
    },
    {
      "name": "PostgreSQL (Internal)",
      "type": "postgres",
      "hostname": "postgres.drone-store.svc.cluster.local",
      "port": 5432,
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "active": true
    },
    {
      "name": "Redis (Internal)",
      "type": "redis",
      "hostname": "redis.drone-store.svc.cluster.local",
      "port": 6379,
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "active": true
    },
    {
      "name": "Docker Registry (Internal)",
      "type": "http",
      "url": "http://registry.drone-store.svc.cluster.local:5000/v2/",
      "method": "GET",
      "interval": 60,
      "maxretries": 3,
      "retryInterval": 60,
      "timeout": 48,
      "active": true
    }
  ]
}
EOF
  
  echo "Monitor configuration saved to /tmp/kuma-setup.json"
  echo ""
  echo "================================================================"
  echo "UPTIME KUMA INITIAL SETUP REQUIRED"
  echo "================================================================"
  echo ""
  echo "To complete setup:"
  echo "1. Visit https://kuma.yirrasystems.com"
  echo "2. Create admin account with these credentials:"
  echo "   Username: $ADMIN_USER"
  echo "   Password: $ADMIN_PASS"
  echo ""
  echo "3. Import monitors from the configuration below or create manually:"
  echo ""
  echo "=== MONITORS TO CREATE ==="
  echo ""
  echo "EXTERNAL SERVICES (HTTPS):"
  echo "  • Main Site: https://yirrasystems.com"
  echo "  • Backend API: https://yirrasystems.com/api/health"
  echo "  • Admin Panel: https://app.yirrasystems.com"
  echo "  • Documentation: https://docs.yirrasystems.com"
  echo "  • N8N Workflows: https://flows.yirrasystems.com"
  echo ""
  echo "INTERNAL SERVICES:"
  echo "  • PostgreSQL: postgres.drone-store.svc.cluster.local:5432"
  echo "  • Redis: redis.drone-store.svc.cluster.local:6379"
  echo "  • Docker Registry: http://registry.drone-store.svc.cluster.local:5000/v2/"
  echo ""
  echo "Check interval: 60 seconds for all monitors"
  echo "================================================================"
  
else
  echo "Uptime Kuma is already configured!"
fi

echo "Setup complete!"




