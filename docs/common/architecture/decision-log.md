# Architecture Decision Log (ADR) - Shared

## Version: 1.0
## Date: 09.01.2026

This document records the key shared architectural decisions made for the Serein project. Some decisions may have different implementations depending on the version (standard vs open source).

---

## Format

Each ADR follows this format:
- **Status**: Proposed / Accepted / Rejected / Deprecated
- **Context**: Why this decision is needed
- **Decision**: The chosen decision
- **Consequences**: Impact of the decision
- **Version Note**: Implementation differences by version

---

## ADR-001: Microservices Architecture

**Status**: Accepted  
**Date**: 09.01.2026

### Context
The system must be scalable, maintainable, and allow independent component deployment.

### Decision
Adopt a microservices architecture with:
- Independent services (auth, user, conversation, AI, content, voice)
- Communication via REST APIs
- Each service with its own database
- API Gateway for routing

### Consequences
- ✅ Easier horizontal scalability
- ✅ Independent deployment
- ✅ Error isolation
- ⚠️ Increased operational complexity
- ⚠️ Requires orchestration (Kubernetes)

### Version Note
- **Standard**: Kong API Gateway
- **Open Source**: Nginx/Traefik API Gateway

---

## ADR-002: TypeScript for All Code

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need maintainability, strong typing, and better DX (Developer Experience).

### Decision
Use TypeScript for:
- All backend services
- All frontend applications
- The SDK

### Consequences
- ✅ Static typing reduces errors
- ✅ Better IDE autocomplete
- ✅ Safer refactoring
- ⚠️ Learning curve for some developers
- ⚠️ Compilation time

---

## ADR-003: PostgreSQL as Primary Database

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need a robust relational database for structured data (users, conversations, messages).

### Decision
Use PostgreSQL 15+ as the primary database with Prisma as the ORM.

### Consequences
- ✅ Robust and reliable
- ✅ ACID transaction support
- ✅ Rich ecosystem
- ✅ Prisma provides excellent DX
- ⚠️ Requires migration management
- ⚠️ Vertical scaling more than horizontal (without sharding)

---

## ADR-004: Redis for Cache and Sessions

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need performance for caching and session management.

### Decision
Use Redis for:
- Cache frequent AI responses
- User session management
- Rate limiting
- Message queue (pub/sub)

### Consequences
- ✅ High performance
- ✅ Rich data structures
- ✅ Native pub/sub support
- ⚠️ Volatile data (requires persistence if critical)
- ⚠️ Requires memory management

---

## ADR-005: Multi-Provider AI Services

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need flexibility, reduced vendor lock-in risk, and cost/resource optimization.

### Decision
Support multiple AI providers with an abstraction layer to add new providers easily.

### Consequences
- ✅ Provider flexibility
- ✅ Reduced dependency risk
- ✅ Potential cost/resource optimization
- ⚠️ Abstraction complexity
- ⚠️ Requires tests for each provider

### Version Note
- **Standard**: OpenAI, Anthropic (cloud)
- **Open Source**: Ollama with multiple models (Llama, Mistral, Phi)

---

## ADR-006: Intelligent AI Model Orchestration

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need to optimize costs/resources while maintaining response quality.

### Decision
Implement orchestration logic:
- Start with cost-effective/performance models
- Scale up to advanced models if the question is complex
- Evaluate complexity before selecting a model

### Consequences
- ✅ Cost/resource optimization
- ✅ Maintained quality for complex questions
- ⚠️ Complexity evaluation logic to maintain
- ⚠️ Requires usage monitoring

### Version Note
- **Standard**: GPT-3.5 → GPT-4 (cost optimization)
- **Open Source**: Phi/Mistral 7B → Llama 2 70B (resource optimization)

---

## ADR-007: Strict Well-being Domain Limitation

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Legal and ethical responsibility: avoid medical advice or out-of-domain content.

### Decision
Implement domain filters:
- Automatic detection of medical questions
- Redirect to professionals for medical questions
- Strict limitation to well-being/philosophy/spirituality

### Consequences
- ✅ Reduced legal risk
- ✅ Focus on domain expertise
- ✅ User protection
- ⚠️ Requires robust detection logic
- ⚠️ May frustrate some users

---

## ADR-008: API Gateway for Routing and Security

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need centralized authentication, rate limiting, and routing.

### Decision
Use an API Gateway:
- Routing to backend services
- Centralized authentication
- Rate limiting
- Centralized logging

### Consequences
- ✅ Centralized security
- ✅ Simplified traffic management
- ✅ Single entry point
- ⚠️ Single point of failure (requires HA)
- ⚠️ Added latency (minimal)

### Version Note
- **Standard**: Kong
- **Open Source**: Nginx / Traefik

---

## ADR-009: JWT for Authentication

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need stateless, scalable, and secure authentication.

### Decision
Use JWT (JSON Web Tokens) for:
- Access tokens (short duration: 15 min)
- Refresh tokens (long duration: 7 days)
- Validation at the API Gateway

### Consequences
- ✅ Stateless (scalable)
- ✅ No session store required for tokens
- ✅ Industry standard
- ⚠️ Tokens cannot be revoked before expiration (use blacklist if needed)
- ⚠️ Token size (limit if many claims)

---

## ADR-010: Vector Database for Semantic Search

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need semantic search across books and content for recommendations.

### Decision
Use a vector database for:
- Storing book embeddings
- Semantic search
- Similarity-based recommendations

### Consequences
- ✅ High-performance semantic search
- ✅ Scalability
- ✅ Easy to use
- ⚠️ Cost at scale (standard version)
- ⚠️ Maintenance required (open source version)

### Version Note
- **Standard**: Pinecone (cloud)
- **Open Source**: Weaviate / Qdrant (self-hosted)

---

## ADR-011: React for Frontend

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need a modern, responsive, and maintainable UI.

### Decision
Use React 18+ with:
- TypeScript
- Vite for builds
- Tailwind CSS for styling
- React Query for data fetching

### Consequences
- ✅ Rich ecosystem
- ✅ Large community
- ✅ Performance with React 18
- ⚠️ Learning curve
- ⚠️ Requires state management (Zustand/React Query)

---

## ADR-012: Docker for Containerization

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need reproducibility, isolation, and easy deployment.

### Decision
Use Docker for:
- Containerizing all services
- Docker Compose for local development
- Kubernetes for production

### Consequences
- ✅ Reproducible environments
- ✅ Service isolation
- ✅ Easy deployment
- ⚠️ Docker learning curve
- ⚠️ Requires image management

---

## ADR-013: Structured Logging with JSON

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need structured logs to simplify analysis and monitoring.

### Decision
Use Pino for logging:
- Structured JSON format
- Appropriate log levels
- Centralization with ELK or Loki

### Consequences
- ✅ Easily analyzable logs
- ✅ Integrates with monitoring tools
- ✅ Performance (Pino is very fast)
- ⚠️ Requires centralized logging infrastructure
- ⚠️ Log size (JSON is more verbose)

### Version Note
- **Standard**: ELK Stack or Datadog Logs
- **Open Source**: Loki + Promtail

---

## ADR-014: Monitoring

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need visibility into performance, errors, and system health.

### Decision
Use monitoring tools for:
- Performance metrics
- Error tracking
- Distributed tracing

### Consequences
- ✅ Full system visibility
- ✅ Fast issue detection
- ✅ Performance metrics
- ⚠️ Costs (standard version)
- ⚠️ Requires configuration and maintenance

### Version Note
- **Standard**: Datadog, Sentry Cloud
- **Open Source**: Prometheus + Grafana, Sentry Self-hosted, Jaeger

---

## ADR-015: JavaScript/TypeScript SDK for Integration

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need to simplify integration in different environments (web, mobile, widgets).

### Decision
Create an official SDK:
- JavaScript/TypeScript
- Support ES modules and CommonJS
- Full documentation
- Usage examples

### Consequences
- ✅ Easy integration
- ✅ Easier adoption
- ✅ Centralized support
- ⚠️ Requires SDK maintenance
- ⚠️ Versioning to manage

---

## ADR-016: Tests with Minimum 80% Coverage

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need code quality and confidence in deployments.

### Decision
Require:
- Minimum 80% coverage
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for critical scenarios

### Consequences
- ✅ Improved code quality
- ✅ Confidence in changes
- ✅ Living documentation (tests)
- ⚠️ Increased development time
- ⚠️ Test maintenance

---

## ADR-017: CI/CD with GitHub Actions

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need automation for tests and deployments.

### Decision
Use GitHub Actions for:
- Automated tests on PRs
- Linting and formatting
- Automated deployment (staging/production)
- Documentation generation

### Consequences
- ✅ Full automation
- ✅ Integrated with GitHub
- ✅ Free for open source
- ⚠️ Requires configuration
- ⚠️ Limits on free minutes

---

## ADR-018: Prisma as ORM

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need a type-safe ORM with migrations and excellent DX.

### Decision
Use Prisma as the ORM:
- Type safety with TypeScript
- Automatic migrations
- Excellent tooling (Prisma Studio)
- Native PostgreSQL support

### Consequences
- ✅ Excellent type safety
- ✅ Easy migrations
- ✅ Great DX
- ⚠️ Learning curve
- ⚠️ Code generation required

---

## ADR-019: WebSocket for Real-Time Conversations

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need smooth real-time conversations, especially for voice mode.

### Decision
Use WebSocket for:
- Real-time conversations
- AI response streaming
- Conversation state updates

### Consequences
- ✅ Smooth user experience
- ✅ Streaming responses
- ✅ Improved responsiveness
- ⚠️ Connection management complexity
- ⚠️ Requires reconnection handling

---

## ADR-020: Rate Limiting per User

**Status**: Accepted  
**Date**: 09.01.2026

### Context
Need to protect the system against abuse and control costs/resources.

### Decision
Implement rate limiting:
- Per authenticated user
- Per IP for public endpoints
- Configurable per endpoint
- Use Redis for counters

### Consequences
- ✅ Abuse protection
- ✅ Cost/resource control
- ✅ Fair usage
- ⚠️ May block legitimate users if misconfigured
- ⚠️ Requires tuning limits

---

## Notes

- ADRs are living documents and can be updated
- Decisions may be revisited if context changes
- Any new important architectural decision must be documented here
- Implementation differences between versions are noted in each ADR

---

**Note**: This document describes shared decisions. For version-specific decisions, see the ADRs in each version's documentation.
