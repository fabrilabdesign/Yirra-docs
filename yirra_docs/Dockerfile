# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the static site
RUN npm run build

# Production stage
FROM nginxinc/nginx-unprivileged:stable-alpine

# Accept Clerk key as build arg
ARG CLERK_PUBLISHABLE_KEY

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy login and logout pages
COPY --from=build /app/login.html /usr/share/nginx/html/
COPY --from=build /app/logout.html /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Switch to root temporarily to set up config
USER root

# Inject Clerk key directly into a config file at build time
RUN if [ -n "$CLERK_PUBLISHABLE_KEY" ]; then \
      echo "window.CLERK_PUBLISHABLE_KEY = \"$CLERK_PUBLISHABLE_KEY\";" > /usr/share/nginx/html/clerk-config.js; \
      sed -i 's|</head>|<script src="/clerk-config.js"></script></head>|' /usr/share/nginx/html/index.html; \
    fi && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch back to nginx user
USER nginx

# Expose port 4000 (different from frontend's 3000)
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/healthz || exit 1

# Start nginx directly
CMD ["nginx", "-g", "daemon off;"]

