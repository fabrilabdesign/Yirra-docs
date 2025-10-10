#!/usr/bin/env python3
"""
Uptime Kuma Auto-Setup Script
Automatically configures monitors via the Uptime Kuma API
"""

import os
import sys
import time
import json
import socketio

KUMA_URL = os.getenv('KUMA_URL', 'http://uptime-kuma-service.monitoring:3001')
USERNAME = os.getenv('KUMA_USERNAME', 'admin')
PASSWORD = os.getenv('KUMA_PASSWORD')

if not PASSWORD:
    print("Error: KUMA_PASSWORD environment variable is required")
    print("Usage: KUMA_PASSWORD='your-password' python3 auto-setup-monitors.py")
    sys.exit(1)

# Monitor configurations
MONITORS = [
    {
        "type": "http",
        "name": "🌐 Main Site",
        "url": "https://yirrasystems.com",
        "method": "GET",
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "timeout": 48,
        "active": True,
    },
    {
        "type": "http",
        "name": "🔌 Backend API",
        "url": "https://yirrasystems.com/api/health",
        "method": "GET",
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "timeout": 48,
        "active": True,
    },
    {
        "type": "http",
        "name": "👨‍💼 Admin Panel",
        "url": "https://app.yirrasystems.com",
        "method": "GET",
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "timeout": 48,
        "active": True,
    },
    {
        "type": "http",
        "name": "📚 Documentation",
        "url": "https://docs.yirrasystems.com",
        "method": "GET",
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "timeout": 48,
        "active": True,
    },
    {
        "type": "http",
        "name": "⚙️ N8N Workflows",
        "url": "https://flows.yirrasystems.com",
        "method": "GET",
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "timeout": 48,
        "active": True,
    },
    {
        "type": "http",
        "name": "📦 Docker Registry",
        "url": "http://registry.drone-store.svc.cluster.local:5000/v2/",
        "method": "GET",
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "timeout": 48,
        "active": True,
    },
    {
        "type": "port",
        "name": "🗄️ PostgreSQL",
        "hostname": "postgres.drone-store.svc.cluster.local",
        "port": 5432,
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "active": True,
    },
    {
        "type": "port",
        "name": "⚡ Redis",
        "hostname": "redis.drone-store.svc.cluster.local",
        "port": 6379,
        "interval": 60,
        "maxretries": 3,
        "retryInterval": 60,
        "active": True,
    },
]

print("=" * 60)
print("Uptime Kuma Auto-Configuration")
print("=" * 60)
print(f"URL: {KUMA_URL}")
print(f"Username: {USERNAME}")
print()

# Create socket.io client
sio = socketio.Client()
authenticated = False
monitors_created = 0

@sio.event
def connect():
    print("✓ Connected to Uptime Kuma")

@sio.event
def disconnect():
    print("✓ Disconnected")

@sio.on('info')
def on_info(data):
    print(f"✓ Server info received")

@sio.on('autoLogin')
def on_auto_login():
    print("  Auto-login successful")

try:
    print("Connecting to Uptime Kuma...")
    sio.connect(KUMA_URL, transports=['polling', 'websocket'])
    time.sleep(1)
    
    # Try to login
    print("Authenticating...")
    
    def login_callback(data):
        global authenticated
        if data.get('ok'):
            print("✓ Authentication successful!")
            authenticated = True
        else:
            print(f"✗ Authentication failed: {data.get('msg', 'Unknown error')}")
            sys.exit(1)
    
    sio.emit('login', {
        'username': USERNAME,
        'password': PASSWORD,
        'token': None
    }, callback=login_callback)
    
    time.sleep(2)
    
    if not authenticated:
        print("✗ Failed to authenticate")
        print()
        print("Please ensure you have:")
        print("1. Created an admin account at https://kuma.yirrasystems.com")
        print("2. Used the correct username and password")
        sys.exit(1)
    
    # Get existing monitors to avoid duplicates
    def get_monitors_callback(data):
        global monitors_created
        existing_names = [m['name'] for m in data]
        print(f"\n✓ Found {len(existing_names)} existing monitors")
        
        if existing_names:
            print("  Existing monitors:", ", ".join(existing_names))
            print()
        
        # Create monitors
        print("Creating monitors...")
        print()
        
        for monitor in MONITORS:
            if monitor['name'] in existing_names:
                print(f"  ⊘ Skipping '{monitor['name']}' (already exists)")
                continue
            
            def add_callback(data):
                global monitors_created
                if data.get('ok'):
                    print(f"  ✓ Created '{monitor['name']}'")
                    monitors_created += 1
                else:
                    print(f"  ✗ Failed to create '{monitor['name']}': {data.get('msg', 'Unknown')}")
            
            sio.emit('add', monitor, callback=add_callback)
            time.sleep(0.5)
    
    sio.emit('getMonitorList', callback=get_monitors_callback)
    time.sleep(3)
    
    print()
    print("=" * 60)
    print("✓ Setup Complete!")
    print("=" * 60)
    print()
    print(f"Created {monitors_created} new monitors")
    print(f"Total monitors configured: {len(MONITORS)}")
    print()
    print("Visit https://kuma.yirrasystems.com to view your dashboard")
    print()
    
    sio.disconnect()

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)



