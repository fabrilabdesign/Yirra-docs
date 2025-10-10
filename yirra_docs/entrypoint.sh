#!/bin/sh
set -e

# Inject Clerk key at runtime from environment variable
if [ -n "$CLERK_PUBLISHABLE_KEY" ]; then
  echo "Injecting Clerk publishable key..."
  
  # Create clerk-config.js with proper permissions
  echo "window.CLERK_PUBLISHABLE_KEY = \"$CLERK_PUBLISHABLE_KEY\";" > /tmp/clerk-config.js
  cat /tmp/clerk-config.js > /usr/share/nginx/html/clerk-config.js
  
  # Inject script tag into index.html if not already present
  if [ -f /usr/share/nginx/html/index.html ] && ! grep -q "clerk-config.js" /usr/share/nginx/html/index.html; then
    # Create temp file with modification
    sed 's|</head>|<script src="/clerk-config.js"></script></head>|' /usr/share/nginx/html/index.html > /tmp/index.html
    cat /tmp/index.html > /usr/share/nginx/html/index.html
  fi
else
  echo "Warning: CLERK_PUBLISHABLE_KEY not set"
fi

echo "Starting Nginx..."
exec "$@"

