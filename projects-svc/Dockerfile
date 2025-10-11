FROM node:18-slim AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev || npm install --omit=dev
# Ensure OpenSSL and certs are available for Prisma engines
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY . .
# Prisma expects schema at prisma/schema.prisma; move our prisma.schema
RUN mkdir -p prisma && mv prisma.schema prisma/schema.prisma && npx prisma generate || true
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD sh -lc "npx prisma db push && node src/index.js"
