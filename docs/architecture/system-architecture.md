# Open Source System Architecture - Serein

## Version: 1.0
## Date: 09.01.2026

---

## 1. Overview

This architecture uses **only open source technologies** to enable a fully self-hosted deployment.

### 1.1 Architectural Principles

- **Microservices**: Modular architecture with independent services
- **Open Source First**: All technologies are open source
- **Self-Hosted**: Deployment on your own infrastructure
- **Cost-Effective**: No proprietary cloud service costs
- **Security by Design**: Built-in security, auditable code

### 1.2 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │  SDK/Widget  │      │
│  │  (React)     │  │  (React)     │  │  (JS/TS)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Nginx / Traefik (Open Source)                │  │
│  │  - Authentication  - Rate Limiting  - Load Balancing  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Auth       │   │  Conversation │   │   Content    │
│   Service    │   │   Service     │   │   Service    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   User       │   │   AI         │   │   Search     │
│   Service    │   │   Service    │   │   Service    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   PostgreSQL │  │   Redis      │  │   Weaviate   │      │
│  │   (Primary)  │  │   (Cache)    │  │  (Vector DB) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Open Source AI Services                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Ollama     │  │  Coqui TTS   │  │   Whisper    │      │
│  │   (LLM)      │  │   (TTS)      │  │   (STT)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Open Source Monitoring Stack                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Prometheus   │  │   Grafana    │  │    Loki      │      │
│  │ (Metrics)    │  │(Visualization)│  │  (Logging)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Services (Open Source)

### 2.1 Auth Service

**Technologies**: Node.js, Express, JWT, bcrypt  
**Database**: PostgreSQL  
**APIs**: Same as the standard version

### 2.2 User Service

**Technologies**: Node.js, Express, Prisma  
**Database**: PostgreSQL  
**APIs**: Same as the standard version

### 2.3 Conversation Service

**Technologies**: Node.js, Express, Prisma  
**Database**: PostgreSQL  
**APIs**: Same as the standard version

### 2.4 AI Service (Open Source)

**Technologies**: Node.js, Express  
**LLM Provider**: Ollama (local or dedicated server)  
**Supported models**:
- Llama 2/3 (Meta)
- Mistral (Mistral AI)
- Phi (Microsoft)
- CodeLlama (Meta)

**Selection Logic**:
1. Evaluate question complexity
2. Use a lightweight model for simple questions (Phi, Mistral 7B)
3. Use a stronger model for complex questions (Llama 70B, Mistral Large)
4. No per-token cost (free)

**APIs**:
- `POST /ai/chat` - Chat with the AI agent
- `POST /ai/chat/stream` - Streaming chat
- `GET /ai/models` - List available models (Ollama)

### 2.5 Content Service

**Technologies**: Node.js, Express  
**Vector Database**: Weaviate (open source, self-hosted)  
**Database**: PostgreSQL

**APIs**:
- `POST /content/search` - Search for books (semantic search via Weaviate)
- `GET /content/books` - List available books
- `GET /content/books/:id` - Book details
- `POST /content/recommendations` - Recommendations based on beliefs

### 2.6 Voice Service (Open Source)

**Technologies**: Node.js, Express  
**TTS**: Coqui TTS or Piper TTS  
**STT**: Whisper (via REST API)

**APIs**:
- `POST /voice/synthesize` - Voice synthesis (Coqui TTS)
- `POST /voice/transcribe` - Voice transcription (Whisper)
- `GET /voice/voices` - List available voices

**Deployment**:
- Coqui TTS: Python service with REST API
- Whisper: Python service with REST API (faster-whisper)

---

## 3. Open Source Infrastructure

### 3.1 API Gateway

**Nginx** or **Traefik**
- Routing to backend services
- Centralized authentication
- Rate limiting
- Load balancing
- SSL/TLS termination

### 3.2 Container Orchestration

**Kubernetes** (open source)
- Service orchestration
- Auto-scaling
- Service discovery
- Health checks

**Alternative**: Docker Compose (for development)

### 3.3 Monitoring Stack

**Prometheus**
- Metrics collection
- Alerting
- Time-series database

**Grafana**
- Metrics visualization
- Dashboards
- Alerting

**Loki + Promtail**
- Log collection
- Centralization
- Prometheus-like queries

**Jaeger**
- Distributed tracing
- OpenTelemetry compatible

---

## 4. Open Source Databases

### 4.1 PostgreSQL

**Usage**: Primary database  
**Version**: 15+  
**ORM**: Prisma (open source)

### 4.2 Redis

**Usage**: Cache, sessions, rate limiting  
**Version**: 7.0+

### 4.3 Weaviate

**Usage**: Vector database for semantic search  
**Deployment**: Self-hosted  
**Alternatives**: Qdrant, Milvus

---

## 5. Open Source AI Services

### 5.1 Ollama (LLM)

**Deployment**:
- Local on a dedicated server
- Via Docker
- OpenAI-compatible REST API

**Models**:
- **Lightweight**: Phi-2, Mistral 7B
- **Medium**: Llama 2 13B, Mistral Medium
- **Powerful**: Llama 2 70B, Mistral Large

**Performance**:
- GPU recommended for models > 7B
- CPU possible for models < 7B

### 5.2 Coqui TTS

**Deployment**:
- Python service with REST API
- Via Docker
- Multiple voice support

**Alternatives**:
- Piper TTS (lighter)
- Mozilla TTS

### 5.3 Whisper

**Deployment**:
- Python service with REST API
- Via Docker
- faster-whisper for performance

**Models**:
- tiny, base, small, medium, large
- Multi-language support

---

## 6. Differences vs Standard Version

### 6.1 AI Services

| Component | Standard | Open Source |
|-----------|----------|-------------|
| LLM | OpenAI/Anthropic (cloud) | Ollama (local) |
| TTS | ElevenLabs (cloud) | Coqui TTS (local) |
| STT | Azure Speech (cloud) | Whisper (local) |
| Vector DB | Pinecone (cloud) | Weaviate (local) |

### 6.2 Infrastructure

| Component | Standard | Open Source |
|-----------|----------|-------------|
| API Gateway | Kong Cloud | Nginx/Traefik |
| Monitoring | Datadog | Prometheus + Grafana |
| Logging | Datadog | Loki |
| Error Tracking | Sentry Cloud | Sentry Self-hosted |

### 6.3 Costs

| Type | Standard | Open Source |
|------|----------|-------------|
| AI Services | $500-2000/month | $0 (local) |
| Infrastructure | $100-500/month | $50-200/month (servers) |
| **Total** | **$600-2500/month** | **$50-200/month** |

---

## 7. Self-Hosted Deployment

### 7.1 Self-Hosted Architecture

```
┌─────────────────────────────────────────┐
│      Your Server / Infrastructure       │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │     Kubernetes / Docker Compose  │  │
│  │                                   │  │
│  │  Backend Services (Node.js)       │  │
│  │  Frontend (React)                 │  │
│  │  PostgreSQL                       │  │
│  │  Redis                            │  │
│  │  Weaviate                         │  │
│  │  Ollama (LLM)                     │  │
│  │  Coqui TTS                        │  │
│  │  Whisper                          │  │
│  │  Prometheus + Grafana             │  │
│  │  Loki                             │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 7.2 System Requirements

**Minimum**:
- CPU: 8 cores
- RAM: 32 GB
- Storage: 500 GB SSD
- GPU: Optional (recommended for LLM)

**Recommended**:
- CPU: 16+ cores
- RAM: 64+ GB
- Storage: 1 TB+ SSD
- GPU: NVIDIA with 16+ GB VRAM

---

## 8. Benefits of the Open Source Architecture

### 8.1 Costs
- ✅ No cloud service costs
- ✅ Costs limited to infrastructure
- ✅ No per-token/request costs

### 8.2 Control
- ✅ Full control over data
- ✅ No vendor lock-in
- ✅ Deploy anywhere

### 8.3 Security
- ✅ Auditable source code
- ✅ No dependency on external services
- ✅ Easier GDPR compliance

### 8.4 Flexibility
- ✅ Full customization
- ✅ No rate limits
- ✅ Easy integration

---

## 9. Conclusion

This open source architecture enables you to:
- ✅ Drastically reduce costs
- ✅ Maintain full control
- ✅ Deploy self-hosted
- ✅ Use professional-grade technologies
- ✅ Avoid vendor lock-in

The architecture is designed to be as performant as the standard version while being fully open source and self-hostable.
