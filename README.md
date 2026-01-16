# Serein - Open Source Version

AI well-being platform built exclusively with open source tools and technologies.

## 🎯 Open Source Philosophy

This version of Serein uses only open source technologies to:
- ✅ Reduce infrastructure costs
- ✅ Avoid vendor lock-in
- ✅ Enable self-hosted deployment
- ✅ Maintain transparency and security

## 📋 Documentation

This version is **fully autonomous** with its own documentation and history.

### Main Documentation

- **[README-SETUP.md](README-SETUP.md)** - Complete setup and configuration guide
- **[STRUCTURE.md](STRUCTURE.md)** - Detailed project structure
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Full documentation index
- **[CHANGELOG.md](CHANGELOG.md)** - Full version history (Semantic Versioning)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guide

### Technical Documentation

- **[Documentation Index](docs/README.md)** - Documentation overview
- **[Development Roadmap](docs/ROADMAP.md)** - Full roadmap
- **[Open Source System Architecture](docs/architecture/system-architecture.md)** - Architecture with open source services
- **[Open Source Technology Stack](docs/technology-stack.md)** - Open source technologies
- **[Self-Hosted Deployment Guide](docs/deployment/self-hosted.md)** - Complete guide
- **[Standard vs Open Source Comparison](docs/comparison.md)** - Detailed comparison

### Shared Documentation (Referenced)

- [Functional Requirements](docs/common/requirements/functional-requirements.md) - 56 requirements
- [Non-Functional Requirements](docs/common/requirements/non-functional-requirements.md) - 76 requirements
- [Base Architecture](docs/common/architecture/system-architecture.md) - Shared architecture
- [Boundaries](docs/common/architecture/boundaries.md) - System boundaries
- [Decision Log (ADR)](docs/common/architecture/decision-log.md) - Architectural decisions
- [Test Strategy](docs/common/testing/test-strategy.md) - Complete strategy

## 🏗️ Project Structure

```
serein-opensource/
├── docs/                    # Documentation
│   ├── requirements/        # Requirements
│   ├── architecture/        # Open source architecture
│   └── deployment/          # Deployment guides
├── services/                # Backend microservices
│   ├── auth-service/        # Authentication service
│   ├── user-service/        # User management service
│   ├── conversation-service/# Conversation service
│   ├── ai-service/          # AI orchestration service (open source)
│   ├── content-service/     # Content search service
│   └── voice-service/       # Voice synthesis service (open source)
├── frontend/                # Frontend application
│   ├── web/                 # React web app
│   └── sdk/                 # JavaScript/TypeScript SDK
├── infrastructure/          # Infrastructure as Code
│   ├── docker/              # Docker configurations
│   ├── kubernetes/          # Kubernetes configurations
│   └── terraform/           # Terraform configurations
└── tests/                   # Tests
    ├── unit/                # Unit tests
    ├── integration/         # Integration tests
    └── e2e/                 # End-to-end tests
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS+
- Docker and Docker Compose
- PostgreSQL 15+ (or open source alternative)
- Redis 7.0+
- Open source LLM model (Llama, Mistral, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/serein-opensource.git
cd serein-opensource

# Install dependencies
npm install

# Start services with Docker Compose
docker-compose up -d

# Run migrations
npm run migrate

# Start the application
npm run dev
```

## 🛠️ Open Source Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Query

### Backend
- Node.js 20 + TypeScript
- Express.js / Fastify
- Prisma (ORM)
- PostgreSQL
- Redis

### AI (100% Open Source)
- **LLM**: Ollama (Llama, Mistral, Phi)
- **TTS**: Coqui TTS / Piper TTS
- **STT**: Whisper (OpenAI, but open source)

### Infrastructure
- Docker
- Kubernetes
- Nginx / Traefik (API Gateway)
- Prometheus + Grafana (Monitoring)
- Loki + Promtail (Logging)
- Jaeger (Tracing)

### Databases
- PostgreSQL (relational)
- Redis (cache)
- Weaviate / Qdrant (vector database)

## 🔐 Security

- JWT authentication
- Data encryption (TLS, encryption at rest)
- Rate limiting
- Input validation
- GDPR compliance

## 📊 Monitoring (Open Source)

- Structured logging (Pino → Loki)
- Metrics (Prometheus)
- Visualization (Grafana)
- Error tracking (Sentry self-hosted or alternative)
- Distributed tracing (Jaeger)

## 💰 Costs

With this open source stack:
- ✅ No proprietary cloud service costs
- ✅ Self-hosted deployment possible
- ✅ Costs limited to infrastructure (servers)
- ✅ Local AI models (no per-token costs)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the [MIT](LICENSE).

## 🔄 Differences vs Standard Version

| Component | Standard Version | Open Source Version |
|-----------|------------------|---------------------|
| LLM | OpenAI / Anthropic | Ollama (Llama/Mistral) |
| TTS | ElevenLabs | Coqui TTS / Piper |
| STT | Azure Speech | Whisper |
| Vector DB | Pinecone | Weaviate / Qdrant |
| API Gateway | Kong | Nginx / Traefik |
| Monitoring | Datadog | Prometheus + Grafana |
| Error Tracking | Sentry Cloud | Sentry Self-hosted |

---

**Note**: This version is optimized for self-hosted deployment and open source technologies.
