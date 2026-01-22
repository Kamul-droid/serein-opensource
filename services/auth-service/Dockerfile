FROM node:20-slim AS builder

WORKDIR /app

# Copy shared package and base config
COPY shared ./shared
COPY tsconfig.base.json ./tsconfig.base.json

# Build shared package
WORKDIR /app/shared
RUN npm install
RUN npm run build

# Copy service source
WORKDIR /app
COPY services/auth-service ./services/auth-service

# Install dependencies
WORKDIR /app/services/auth-service
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

# Prisma requires OpenSSL at runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy shared package (built) and service package files
COPY --from=builder /app/shared ./shared
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/auth-service/prisma ./services/auth-service/prisma/

# Install production dependencies only
WORKDIR /app/services/auth-service
RUN npm install --omit=dev

# Copy built files
COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/index.js"]
