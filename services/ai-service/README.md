# AI Service

AI orchestration service for Serein Open Source, backed by Ollama.

## Features

- Model selection (lightweight vs heavy)
- Domain guardrails (well-being only)
- Streaming chat endpoint (NDJSON)
- Health checks for Ollama connectivity

## APIs

- `POST /ai/chat` - Chat with the AI agent
- `POST /ai/chat/stream` - Streamed chat responses (NDJSON)
- `GET /ai/models` - List available models
- `GET /health` - Service health check

**Note**: All routes require authentication (JWT token in Authorization header)

## Environment Variables

```env
PORT=3004
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama2
OLLAMA_LIGHT_MODELS=phi,mistral
OLLAMA_HEAVY_MODELS=llama2,mistral-large
AI_DOMAIN_STRICT=true
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```
