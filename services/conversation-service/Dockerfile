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
COPY services/conversation-service ./services/conversation-service

# Install dependencies
WORKDIR /app/services/conversation-service
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy shared package (built) and service package files
COPY --from=builder /app/shared ./shared
COPY services/conversation-service/package*.json ./services/conversation-service/
COPY services/conversation-service/prisma ./services/conversation-service/prisma/

# Install production dependencies only
WORKDIR /app/services/conversation-service
RUN npm install --omit=dev

# Copy built files
COPY --from=builder /app/services/conversation-service/dist ./dist
COPY --from=builder /app/services/conversation-service/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3003

CMD ["node", "dist/index.js"]
