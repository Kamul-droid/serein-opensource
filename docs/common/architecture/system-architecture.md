# System Architecture - AI Well-being Platform

## Version: 1.0
## Date: 09.01.2026

---

## 1. Overview

This document describes the base architecture shared across all versions of Serein. For the open source-specific architecture, see [Open Source System Architecture](../architecture/system-architecture.md).

### 1.1 Architectural Principles

- **Microservices**: Modular architecture with independent services
- **API-First**: All features exposed via REST/GraphQL APIs
- **Event-Driven**: Asynchronous communication between services via events
- **Security by Design**: Security built in at every level
- **Self-Contained**: Each version is autonomous

---

## 2. Backend Services (Common)

### 2.1 Auth Service

**Responsibilities**:
- User authentication
- JWT token management
- Session management
- Password recovery

**APIs**:
- `POST /auth/register` - Registration
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Token refresh
- `POST /auth/forgot-password` - Password recovery

**Database**: PostgreSQL (tables `users`, `sessions`)

---

### 2.2 User Service

**Responsibilities**:
- User profile management
- User preferences management
- Beliefs and interests management

**APIs**:
- `GET /users/me` - Current user profile
- `PUT /users/me` - Update profile
- `GET /users/me/preferences` - User preferences
- `PUT /users/me/preferences` - Update preferences
- `GET /users/me/beliefs` - User beliefs
- `PUT /users/me/beliefs` - Update beliefs

**Database**: PostgreSQL (tables `user_profiles`, `user_preferences`, `user_beliefs`)

---

### 2.3 Conversation Service

**Responsibilities**:
- Conversation management
- History storage
- Conversation context management
- AI call orchestration

**APIs**:
- `POST /conversations` - Create a new conversation
- `GET /conversations` - List conversations
- `GET /conversations/:id` - Conversation details
- `POST /conversations/:id/messages` - Send a message
- `GET /conversations/:id/messages` - Message history
- `DELETE /conversations/:id` - Delete a conversation
- `WebSocket /conversations/:id/stream` - Real-time conversation stream

**Database**: PostgreSQL (tables `conversations`, `messages`)

---

### 2.4 AI Service

**Responsibilities**:
- AI model orchestration
- Appropriate model selection (performance/complexity)
- Conversation context management
- Domain limits (well-being only)
- "I don't know" response handling

**APIs**:
- `POST /ai/chat` - Chat with the AI agent
- `POST /ai/chat/stream` - Streaming chat
- `GET /ai/models` - List available models

**Note**: Implementation differs by version (cloud services vs open source).

---

### 2.5 Content Service

**Responsibilities**:
- Reference book search
- Knowledge base management
- Semantic content search

**APIs**:
- `POST /content/search` - Search for books
- `GET /content/books` - List available books
- `GET /content/books/:id` - Book details
- `POST /content/recommendations` - Recommendations based on beliefs

**Database**:
- PostgreSQL (tables `books`, `book_categories`)
- Vector DB for semantic search

---

### 2.6 Voice Service

**Responsibilities**:
- Speech synthesis (TTS)
- Speech recognition (STT)
- Voice preference management

**APIs**:
- `POST /voice/synthesize` - Speech synthesis
- `POST /voice/transcribe` - Speech transcription
- `GET /voice/voices` - List available voices

**Note**: Implementation differs by version (cloud services vs open source).

---

## 3. Databases

### 3.1 PostgreSQL (Primary Database)

**Main Schema**:

```sql
-- Users
users (id, email, password_hash, created_at, updated_at)
user_profiles (user_id, name, avatar_url, bio)
user_preferences (user_id, voice_gender, voice_id, communication_mode)
user_beliefs (user_id, belief_type, belief_value)

-- Conversations
conversations (id, user_id, title, created_at, updated_at)
messages (id, conversation_id, role, content, created_at)

-- Content
books (id, title, author, description, category, isbn)
book_categories (id, name, description)

-- AI
ai_requests (id, user_id, conversation_id, model_used, resource_usage, created_at)
```

### 3.2 Redis (Cache)

**Uses**:
- User session cache
- Cache frequent AI responses
- Cache search results
- Rate limiting

### 3.3 Vector Database (Semantic Search)

**Technologies** (by version):
- **Standard Version**: Pinecone (cloud)
- **Open Source Version**: Weaviate / Qdrant (self-hosted)

**Uses**:
- Semantic search across books
- Similar content search
- Conversation embeddings

---

## 4. Architectural Patterns

### 4.1 Repository Pattern
- Data access abstraction
- Easier testing and database changes

### 4.2 Service Layer Pattern
- Business logic in services
- Thin controllers, fat services

### 4.3 Event-Driven Architecture
- Async communication between services
- Service decoupling

### 4.4 Circuit Breaker Pattern
- Protection against cascading failures
- Fallback for external services

### 4.5 Retry Pattern
- Retry with exponential backoff
- For external API calls

---

## 5. Security

### 5.1 Authentication and Authorization
- JWT with short expiration (15 min)
- Refresh tokens with long expiration (7 days)
- RBAC for user roles

### 5.2 Data Protection
- Encryption in transit (TLS 1.3)
- Encryption at rest (AES-256)
- Password hashing (bcrypt/Argon2)

### 5.3 API Security
- Rate limiting per user/IP
- Input validation and sanitization
- CSRF and XSS protection

---

## 6. Scalability

### 6.1 Horizontal Scalability
- Stateless services
- Load balancing
- Database replication

### 6.2 Optimization
- Redis cache for frequent data
- CDN for static assets
- API response compression

---

## 7. Monitoring and Observability

### 7.1 Logging
- Structured logging (JSON)
- Centralized (ELK Stack, Loki)
- Levels: DEBUG, INFO, WARN, ERROR

### 7.2 Metrics
- Response times
- Error rate
- Resource usage
- AI model usage

### 7.3 Tracing
- Distributed tracing (Jaeger, Zipkin)
- Correlation IDs for requests

### 7.4 Alerting
- Alerts for critical errors
- Alerts for threshold breaches
- Alerts for security issues

---

## 8. Deployment

### 8.1 Infrastructure
- **Containers**: Docker
- **Orchestration**: Kubernetes or Docker Compose (dev)
- **CI/CD**: GitHub Actions, GitLab CI, or Jenkins

### 8.2 Environments
- **Development**: Local with Docker Compose
- **Staging**: Test environment
- **Production**: Production environment with high availability

---

## 9. Integration

### 9.1 JavaScript/TypeScript SDK

```typescript
import { SereinClient } from '@serein/sdk';

const client = new SereinClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.serein.com'
});

// Conversation
const conversation = await client.conversations.create();
const response = await client.conversations.sendMessage(conversation.id, {
  message: 'Hello',
  mode: 'text'
});
```

### 9.2 React Component

```typescript
import { SereinChat } from '@serein/react';

<SereinChat
  apiKey="your-api-key"
  voiceEnabled={true}
  voiceGender="female"
  onMessage={(message) => console.log(message)}
/>
```

---

**Note**: This base architecture is shared across both versions. For version-specific details, see:
- [Open Source Architecture](../architecture/system-architecture.md) - Open source version
- [Standard Architecture](../../../serein-standard/docs/architecture/system-architecture.md) - Standard version
