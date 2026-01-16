#!/bin/bash
# Script to setup a new service with standard structure

SERVICE_NAME=$1
SERVICE_PORT=$2

if [ -z "$SERVICE_NAME" ] || [ -z "$SERVICE_PORT" ]; then
  echo "Usage: ./scripts/setup-service.sh <service-name> <port>"
  echo "Example: ./scripts/setup-service.sh auth-service 3001"
  exit 1
fi

SERVICE_DIR="services/$SERVICE_NAME"

# Create directory structure
mkdir -p "$SERVICE_DIR/src/controllers"
mkdir -p "$SERVICE_DIR/src/services"
mkdir -p "$SERVICE_DIR/src/routes"
mkdir -p "$SERVICE_DIR/src/middleware"
mkdir -p "$SERVICE_DIR/src/utils"
mkdir -p "$SERVICE_DIR/src/types"
mkdir -p "$SERVICE_DIR/tests/unit"
mkdir -p "$SERVICE_DIR/tests/integration"

# Create package.json
cat > "$SERVICE_DIR/package.json" << EOF
{
  "name": "@serein/$SERVICE_NAME",
  "version": "1.0.0",
  "description": "$SERVICE_NAME for Serein Open Source",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@serein/shared": "file:../../shared",
    "express": "^4.18.2",
    "pino": "^8.17.0",
    "pino-http": "^8.5.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
EOF

# Create tsconfig.json
cat > "$SERVICE_DIR/tsconfig.json" << EOF
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

# Create .eslintrc.json
cat > "$SERVICE_DIR/.eslintrc.json" << EOF
{
  "extends": ["../../.eslintrc.base.json"]
}
EOF

# Create .prettierrc
cat > "$SERVICE_DIR/.prettierrc" << EOF
{
  "extends": "../../.prettierrc.base.json"
}
EOF

# Create basic index.ts
cat > "$SERVICE_DIR/src/index.ts" << EOF
import express from 'express';
import { createLogger } from '@serein/shared/utils/logger';

const logger = createLogger('$SERVICE_NAME');
const app = express();
const PORT = process.env.PORT || $SERVICE_PORT;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '$SERVICE_NAME',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  logger.info(\`$SERVICE_NAME listening on port \${PORT}\`);
});
EOF

echo "Service $SERVICE_NAME created successfully!"
echo "Next steps:"
echo "1. cd $SERVICE_DIR"
echo "2. npm install"
echo "3. npm run dev"
