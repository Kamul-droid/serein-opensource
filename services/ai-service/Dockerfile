FROM node:20-alpine AS builder

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
COPY services/ai-service ./services/ai-service

# Install dependencies and build service
WORKDIR /app/services/ai-service
RUN npm install
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy shared package (built) and service package files
COPY --from=builder /app/shared ./shared
COPY services/ai-service/package*.json ./services/ai-service/

# Install production dependencies only
WORKDIR /app/services/ai-service
RUN npm install --omit=dev

# Copy built files
COPY --from=builder /app/services/ai-service/dist ./dist

EXPOSE 3004

CMD ["node", "dist/index.js"]
