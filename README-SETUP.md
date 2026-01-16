# Setup Guide - Phase 0.1 Infrastructure

This guide explains how to set up the base infrastructure for Serein Open Source.

## Prerequisites

- Node.js 20 LTS+
- Docker 24.0+ and Docker Compose 2.0+
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/serein-opensource.git
cd serein-opensource
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment configuration

```bash
cp env.example .env
# Edit .env with your settings
```

### 4. Start Docker services

```bash
# Start all services
npm run docker:up

# Check services
npm run docker:ps

# View logs
npm run docker:logs
```

### 5. Initialize Ollama (LLM)

```bash
# Download a model (e.g., Mistral 7B - lighter)
npm run ollama:pull mistral

# Or Llama 2 (more powerful, requires more RAM)
npm run ollama:pull llama2

# List available models
npm run ollama:list
```

### 6. Check Weaviate

```bash
curl http://localhost:8080/v1/.well-known/ready
```

## Project Structure

```
serein-opensource/
├── services/              # Backend microservices
│   ├── auth-service/
│   ├── user-service/
│   ├── conversation-service/
│   ├── ai-service/
│   ├── content-service/
│   └── voice-service/
├── frontend/              # Frontend applications
│   ├── web/              # React web app
│   └── sdk/              # JavaScript/TypeScript SDK
├── shared/                # Shared code
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utilities
├── infrastructure/        # Infrastructure configs
│   ├── nginx/            # API Gateway configuration
│   └── monitoring/       # Prometheus, Grafana, Loki
├── scripts/              # Utility scripts
└── docker-compose.yml    # Docker Compose configuration
```

## Create a New Service

Use the setup script to create a new service with the standard structure:

```bash
npm run setup:service <service-name> <port>
```

Example:
```bash
npm run setup:service auth-service 3001
```

## Docker Services

### Database Services
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Weaviate**: `localhost:8080`

### AI Services
- **Ollama**: `localhost:11434`
- **Coqui TTS**: `localhost:5002`
- **Whisper**: `localhost:5003`

### Monitoring Services
- **Prometheus**: `localhost:9090`
- **Grafana**: `localhost:3001` (admin/admin)
- **Loki**: `localhost:3100`

### API Gateway
- **Nginx**: `localhost:80`

## Available Scripts

### Development
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all workspaces
- `npm run build:shared` - Build the shared package

### Tests
- `npm run test` - Run all tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:coverage` - Tests with coverage

### Code Quality
- `npm run lint` - Lint the code
- `npm run lint:fix` - Lint and auto-fix
- `npm run format` - Format the code
- `npm run format:check` - Check formatting

### Docker
- `npm run docker:up` - Start all services
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs
- `npm run docker:build` - Build images
- `npm run docker:restart` - Restart services
- `npm run docker:ps` - View service status

### Ollama
- `npm run ollama:pull <model>` - Download a model
- `npm run ollama:list` - List available models

## TypeScript Configuration

Each service uses `tsconfig.base.json` as a base and can extend it with its own configs.

## ESLint/Prettier Configuration

Configurations are centralized in:
- `.eslintrc.base.json` - Base ESLint configuration
- `.prettierrc.base.json` - Base Prettier configuration

Each service can extend these configurations.

## Next Steps

1. ✅ Base infrastructure configured
2. ⏭️ Phase 1: Implement Auth Service and User Service
3. ⏭️ Phase 2: Implement Conversation Service and AI Service

See [ROADMAP.md](docs/ROADMAP.md) for details.

## Troubleshooting

### Port already in use
If a port is already in use, change it in `docker-compose.yml` or stop the service using it.

### Ollama does not start
Check that you have enough RAM (minimum 8GB recommended for Mistral 7B).

### Weaviate not responding
Check logs: `docker logs serein-weaviate`

### Services cannot communicate
Ensure all services are on the same Docker network (`serein-network`).

## Support

For more help, see:
- [Documentation](docs/README.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/architecture/system-architecture.md)
