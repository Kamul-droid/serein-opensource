# Open Source Technology Stack - Serein

## Version: 1.0
## Date: 09.01.2026

---

## 1. Overview

This version of Serein uses **only open source technologies** to enable self-hosted deployment, reduce costs, and avoid vendor lock-in.

---

## 2. Frontend

### 2.1 Main Framework

**React 18+**
- **Reason**: Open source, rich ecosystem
- **Version**: 18.2.0+

**TypeScript**
- **Reason**: Open source, static typing
- **Version**: 5.0+

### 2.2 Build Tools

**Vite**
- **Reason**: Open source, fast builds
- **Version**: 5.0+

### 2.3 Styling

**Tailwind CSS**
- **Reason**: Open source, utility-first
- **Version**: 3.4+

### 2.4 State Management

**Zustand / React Query**
- **Zustand**: Open source, lightweight
- **React Query**: Open source, server data management
- **Alternatives**: Redux Toolkit, Jotai (all open source)

---

## 3. Backend

### 3.1 Runtime

**Node.js**
- **Reason**: Open source, JavaScript everywhere
- **Version**: 20 LTS+

**TypeScript**
- **Reason**: Open source, static typing
- **Version**: 5.0+

### 3.2 Web Framework

**Express.js / Fastify**
- **Express**: Open source, standard
- **Fastify**: Open source, faster
- **Version**: Express 4.18+, Fastify 4.25+

**Alternatives**:
- **NestJS**: Open source, modular architecture
- **Hono**: Open source, ultra-fast

### 3.3 API Gateway

**Nginx / Traefik**
- **Nginx**: Open source, performant, well documented
- **Traefik**: Open source, modern, cloud-native
- **Alternatives**:
  - **Kong**: Open source (community edition)
  - **Envoy**: Open source (CNCF)

### 3.4 Authentication

**JWT (jsonwebtoken)**
- **Reason**: Open source, standard
- **Libraries**:
  - `jsonwebtoken`: Open source
  - `bcrypt` or `argon2`: Open source

**OAuth 2.0**
- **Reason**: Open standard
- **Library**: `passport.js` (open source)

### 3.5 Validation

**Zod**
- **Reason**: Open source, TypeScript-first
- **Alternatives**: Joi, Yup (all open source)

---

## 4. Databases

### 4.1 Relational Database

**PostgreSQL**
- **Reason**: Open source, robust, advanced features
- **Version**: 15+
- **ORM**:
  - **Prisma**: Open source, type-safe
  - **TypeORM**: Open source, mature
  - **Drizzle**: Open source, lightweight

### 4.2 Cache

**Redis**
- **Reason**: Open source, performance
- **Version**: 7.0+
- **Use Cases**:
  - Session cache
  - AI response cache
  - Rate limiting
  - Message queue

### 4.3 Vector Database

**Weaviate**
- **Reason**: Open source, self-hosted, scalable
- **Alternatives**:
  - **Qdrant**: Open source, performant
  - **PostgreSQL + pgvector**: Open source, integrated
  - **Milvus**: Open source, scalable

---

## 5. AI Services (100% Open Source)

### 5.1 LLM Providers

**Ollama**
- **Reason**: Open source, local, supports multiple models
- **Supported models**:
  - **Llama 2/3**: Meta (open source)
  - **Mistral**: Mistral AI (open source)
  - **Phi**: Microsoft (open source)
  - **CodeLlama**: Meta (open source)
- **Deployment**: Local or dedicated server

**Alternatives**:
- **vLLM**: Open source, fast inference
- **Text Generation Inference (TGI)**: Hugging Face (open source)
- **LocalAI**: Open source, OpenAI API compatible

### 5.2 TTS (Text-to-Speech)

**Coqui TTS**
- **Reason**: Open source, high quality, natural voices
- **SDK**: `coqui-tts` (Python, but REST API possible)
- **Alternatives**:
  - **Piper TTS**: Open source, light, fast
  - **Mozilla TTS**: Open source, Tacotron-based
  - **eSpeak-NG**: Open source, basic

### 5.3 STT (Speech-to-Text)

**Whisper**
- **Reason**: Open source (OpenAI, MIT license)
- **Deployment**:
  - **Whisper.cpp**: C++ implementation (fast)
  - **faster-whisper**: Python (optimized)
  - **REST API**: Via a dedicated service
- **Alternatives**:
  - **Vosk**: Open source, lightweight
  - **DeepSpeech**: Mozilla (open source, deprecated but usable)

---

## 6. Infrastructure and DevOps

### 6.1 Containers

**Docker**
- **Reason**: Open source, standard
- **Version**: 24.0+

### 6.2 Orchestration

**Kubernetes**
- **Reason**: Open source (CNCF), standard
- **Alternatives**:
  - **Docker Compose**: For development
  - **Nomad**: HashiCorp (open source)

### 6.3 Cloud Providers (Optional)

**Self-Hosted**
- **Reason**: Full control, no cloud costs
- **Alternatives**:
  - **Hetzner**: Dedicated servers (not open source but no vendor lock-in)
  - **OVH**: Dedicated servers
  - **Your own infrastructure**

### 6.4 CI/CD

**GitHub Actions**
- **Reason**: Free for open source, integrated
- **Alternatives**:
  - **GitLab CI**: Open source, self-hosted possible
  - **Jenkins**: Open source, self-hosted
  - **Drone CI**: Open source, cloud-native

### 6.5 Infrastructure as Code

**Terraform**
- **Reason**: Open source, multi-cloud
- **Alternatives**:
  - **Pulumi**: Open source, code-based IaC
  - **Ansible**: Open source, configuration management

---

## 7. Monitoring and Observability (100% Open Source)

### 7.1 Logging

**Pino**
- **Reason**: Open source, ultra-fast, JSON structured logging
- **Centralization**:
  - **Loki + Promtail**: Open source (Grafana Labs)
  - **ELK Stack**: Open source (Elasticsearch, Logstash, Kibana)

### 7.2 APM (Application Performance Monitoring)

**Prometheus + Grafana**
- **Prometheus**: Open source, metrics
- **Grafana**: Open source, visualization
- **Alternatives**:
  - **VictoriaMetrics**: Open source, Prometheus-compatible
  - **InfluxDB + Grafana**: Open source

### 7.3 Error Tracking

**Sentry Self-Hosted**
- **Reason**: Open source, self-hosted possible
- **Alternatives**:
  - **GlitchTip**: Open source, Sentry fork
  - **Rollbar Self-Hosted**: If available

### 7.4 Metrics

**Prometheus**
- **Reason**: Open source, industry standard
- **Visualization**: Grafana (open source)

### 7.5 Tracing

**Jaeger**
- **Reason**: Open source (CNCF), OpenTelemetry-compatible
- **Alternatives**:
  - **Zipkin**: Open source
  - **Tempo**: Grafana (open source)

---

## 8. Security

### 8.1 Security Tools

**Helmet.js**
- **Reason**: Open source, HTTP header hardening

**Rate Limiting**
- **express-rate-limit**: Open source
- **Alternatives**: `@upstash/ratelimit` (Redis-based, open source)

**Input Validation**
- **Zod**: Open source, TypeScript-first validation
- **sanitize-html**: Open source, HTML sanitization

**Security Scanning**
- **Snyk**: Open source (community edition)
- **OWASP ZAP**: Open source, security testing
- **Trivy**: Open source, vulnerability scanning

---

## 9. Message Queue / Event Bus

**Redis Pub/Sub**
- **Reason**: Open source, simple, already used
- **Alternatives**:
  - **RabbitMQ**: Open source, more features
  - **Apache Kafka**: Open source, for high volume
  - **NATS**: Open source, cloud-native

---

## 10. SDK and Integration

### 10.1 JavaScript/TypeScript SDK

**Structure**:
- **Build**: Rollup or esbuild (open source)
- **TypeScript**: Open source
- **Testing**: Jest (open source)
- **Documentation**: TypeDoc (open source)

**Distribution**:
- **npm**: Package registry (open source)
- **CDN**: For direct use (jsDelivr, unpkg - open source)

---

## 11. Development

### 11.1 Code Quality

**ESLint**
- **Reason**: Open source, JavaScript/TypeScript linting
- **Config**: `@typescript-eslint/recommended` (open source)

**Prettier**
- **Reason**: Open source, automatic formatting

**Husky**
- **Reason**: Open source, Git hooks

**lint-staged**
- **Reason**: Open source, lint only changed files

### 11.2 Documentation

**API Documentation**
- **OpenAPI/Swagger**: Open source, API documentation
- **Tools**: `swagger-jsdoc` (open source)

**Code Documentation**
- **JSDoc / TypeDoc**: Open source

**Storybook** (Frontend)
- **Reason**: Open source, UI component documentation

---

## 12. Open Source Stack Summary

### 12.1 Frontend
- React 18 + TypeScript (open source)
- Vite (open source)
- Tailwind CSS (open source)
- React Query + Zustand (open source)

### 12.2 Backend
- Node.js 20 + TypeScript (open source)
- Express.js / Fastify (open source)
- Prisma (open source)
- Zod (open source)
- JWT (open source)

### 12.3 Databases
- PostgreSQL 15+ (open source)
- Redis 7.0+ (open source)
- Weaviate / Qdrant (open source)

### 12.4 AI Services
- Ollama (Llama/Mistral) (open source)
- Coqui TTS / Piper TTS (open source)
- Whisper (open source)

### 12.5 Infrastructure
- Docker (open source)
- Kubernetes (open source)
- Nginx / Traefik (open source)
- Prometheus + Grafana (open source)
- Loki (open source)
- Jaeger (open source)

---

## 13. Comparison with the Standard Version

| Component | Standard Version | Open Source Version |
|-----------|------------------|---------------------|
| **LLM** | OpenAI GPT-4 ($0.03/1K tokens) | Ollama (free, local) |
| **TTS** | ElevenLabs ($0.30/1K chars) | Coqui TTS (free) |
| **STT** | Azure Speech ($) | Whisper (free) |
| **Vector DB** | Pinecone ($70-300/month) | Weaviate (free, self-hosted) |
| **API Gateway** | Kong Cloud ($) | Nginx (free) |
| **Monitoring** | Datadog ($15-50/host) | Prometheus + Grafana (free) |
| **Error Tracking** | Sentry Cloud ($26-80/month) | Sentry Self-hosted (free) |

**Estimated savings**: $500-2000/month → $0-100/month (infrastructure only)

---

## 14. Self-Hosted Deployment

### 14.1 Self-Hosted Architecture

```
┌─────────────────────────────────────────┐
│         Your Infrastructure             │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │  Frontend │  │  Backend │           │
│  │  (React)  │  │ (Node.js)│           │
│  └──────────┘  └──────────┘           │
│         │              │                │
│  ┌──────────┐  ┌──────────┐           │
│  │ PostgreSQL│  │  Redis   │           │
│  └──────────┘  └──────────┘           │
│         │              │                │
│  ┌──────────┐  ┌──────────┐           │
│  │ Weaviate │  │  Ollama   │           │
│  │ (Vector) │  │  (LLM)    │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────────────────────┐         │
│  │  Prometheus + Grafana     │         │
│  │  (Monitoring)             │         │
│  └──────────────────────────┘         │
└─────────────────────────────────────────┘
```

### 14.2 System Requirements

**Minimum**:
- CPU: 8 cores
- RAM: 32 GB
- Storage: 500 GB SSD
- GPU: Optional (recommended for local LLM)

**Recommended**:
- CPU: 16+ cores
- RAM: 64+ GB
- Storage: 1 TB+ SSD
- GPU: NVIDIA with 16+ GB VRAM (for LLM)

---

## 15. Benefits of the Open Source Stack

### 15.1 Costs
- ✅ No proprietary cloud service costs
- ✅ Costs limited to infrastructure
- ✅ No per-token/request costs

### 15.2 Control
- ✅ Full control over data
- ✅ No vendor lock-in
- ✅ Deploy anywhere

### 15.3 Security
- ✅ Auditable source code
- ✅ No dependency on external services
- ✅ Easier GDPR compliance

### 15.4 Flexibility
- ✅ Full customization
- ✅ No rate limits
- ✅ Easy integration

---

## 16. Challenges and Solutions

### 16.1 Challenges

**Deployment Complexity**
- **Solution**: Docker Compose and Kubernetes to simplify

**Maintenance**
- **Solution**: Monitoring and alerting with Prometheus/Grafana

**Local LLM Performance**
- **Solution**: Optimize with vLLM, model quantization

### 16.2 Solutions

- Complete deployment documentation
- Automation scripts
- Community support

---

## 17. Resources

### 17.1 Documentation
- Ollama: https://ollama.ai
- Weaviate: https://weaviate.io
- Coqui TTS: https://coqui.ai
- Whisper: https://github.com/openai/whisper

### 17.2 Communities
- GitHub Discussions
- Stack Overflow
- Project Discord/Slack

---

## 18. Conclusion

This open source stack enables you to:
- ✅ Reduce costs to almost zero
- ✅ Maintain full control
- ✅ Deploy self-hosted
- ✅ Avoid vendor lock-in
- ✅ Use professional-grade technologies

The stack is designed to be as performant as the standard version while remaining fully open source.
