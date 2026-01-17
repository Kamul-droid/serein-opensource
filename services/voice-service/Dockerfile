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
COPY services/voice-service ./services/voice-service

# Install dependencies and build service
WORKDIR /app/services/voice-service
RUN npm install
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy shared package (built) and service package files
COPY --from=builder /app/shared ./shared
COPY services/voice-service/package*.json ./services/voice-service/

# Install production dependencies only
WORKDIR /app/services/voice-service
RUN npm install --omit=dev

# Copy built files
COPY --from=builder /app/services/voice-service/dist ./dist

EXPOSE 3006

CMD ["node", "dist/index.js"]
