# System Boundaries - Serein

## Version: 1.0
## Date: 09.01.2026

---

## 1. Overview

This document defines the system boundaries for Serein: what the system does, what it does not do, and how it interacts with external systems.

**Note**: These boundaries are shared across all Serein versions. Implementations may differ by version (cloud services vs open source).

---

## 2. Functional Boundaries

### 2.1 What the System DOES ✅

#### User Management
- ✅ Authentication and authorization
- ✅ User profile management
- ✅ User preference storage
- ✅ Session management

#### AI Conversation
- ✅ Text conversations with an AI agent
- ✅ Voice conversations with an AI agent
- ✅ Conversation context management
- ✅ Conversation history
- ✅ Belief-based content search

#### Well-being Domain
- ✅ Discussions about philosophy
- ✅ Discussions about spirituality
- ✅ Discussions about personal development
- ✅ Discussions about meditation
- ✅ Discussions about mental and emotional well-being
- ✅ Book and resource recommendations

#### Optimization
- ✅ Smart AI model selection (performance/complexity)
- ✅ Cache for frequent responses
- ✅ Resource usage tracking

### 2.2 What the System DOES NOT DO ❌

#### Medical Diagnosis and Advice
- ❌ Medical diagnosis
- ❌ Medical advice
- ❌ Prescribing medication
- ❌ Treating medical conditions
- ❌ Replacing healthcare professionals

#### Other Out-of-Scope Domains
- ❌ Legal advice (redirect to lawyers)
- ❌ Financial advice (redirect to advisors)
- ❌ Specialized technical advice (redirect to experts)

#### Medical Data Management
- ❌ Storing sensitive medical data
- ❌ Managing medical records
- ❌ Sharing medical data

---

## 3. Technical Boundaries

### 3.1 Internal Boundaries

#### Frontend ↔ Backend
- **Communication**: Only through API Gateway
- **Protocol**: HTTPS for REST, WebSocket for real-time
- **Authentication**: JWT tokens required (except public endpoints)
- **No direct access**: Frontend never accesses databases directly

#### Service ↔ Service
- **Communication**: REST APIs or message queue
- **No DB sharing**: Each service has its own database
- **Decoupling**: Services are independent and deployable separately
- **Contracts**: APIs defined via OpenAPI/Swagger

#### Services ↔ External Services
- **Abstraction**: Adapters/clients for external services
- **Retry Logic**: Retry with exponential backoff
- **Circuit Breaker**: Protection against cascading failures
- **Timeout**: Timeouts configured for all external calls
- **Fallback**: Fallback mechanisms when possible

### 3.2 External Boundaries

#### AI Services
**Standard Version**: OpenAI, Anthropic (cloud)  
**Open Source Version**: Ollama (local)

- **Responsibility**: Provide AI responses
- **Limit**: The system does not control intrinsic model quality
- **Handling**: The system manages model selection and context

#### Voice Services
**Standard Version**: ElevenLabs, Azure Speech (cloud)  
**Open Source Version**: Coqui TTS, Whisper (local)

- **Responsibility**: Speech synthesis and recognition
- **Limit**: The system does not control voice quality
- **Handling**: The system manages user preferences and formatting

#### External Databases
- **PostgreSQL**: Primary storage
- **Redis**: Cache and sessions
- **Vector DB**: Semantic search
  - **Standard Version**: Pinecone (cloud)
  - **Open Source Version**: Weaviate/Qdrant (self-hosted)

---

## 4. Domain Boundaries

### 4.1 Well-being Domain (IN SCOPE)

#### Philosophy
- ✅ Western and Eastern philosophy
- ✅ Ethics and morality
- ✅ Existential questions
- ✅ Reflections on life

#### Spirituality
- ✅ Spiritual traditions (Buddhism, Hinduism, etc.)
- ✅ Meditation and contemplative practices
- ✅ Spiritual development
- ✅ Metaphysical questions

#### Personal Development
- ✅ Personal growth
- ✅ Emotion management
- ✅ Healthy habits
- ✅ Mindfulness

#### Mental Well-being
- ✅ Emotional well-being
- ✅ Stress management
- ✅ Relaxation techniques
- ✅ Work-life balance

### 4.2 Out-of-Scope Domains (with Redirection)

#### Medical Questions
- **Detection**: The system detects medical questions
- **Response**: Disclaimer + redirect to professionals
- **Example**: "I am not a healthcare professional. For medical questions, please consult a doctor."

#### Legal Questions
- **Detection**: The system detects legal questions
- **Response**: Redirect to lawyers
- **Example**: "For legal questions, please consult a qualified lawyer."

#### Financial Questions
- **Detection**: The system detects complex financial questions
- **Response**: Redirect to financial advisors
- **Example**: "For financial advice, please consult a certified financial advisor."

---

## 5. Security Boundaries

### 5.1 User Data

#### Stored Data
- ✅ User profile (name, email, preferences)
- ✅ Beliefs and interests
- ✅ Conversation history
- ✅ Voice and interface preferences

#### NOT Stored
- ❌ Plaintext passwords (hashed only)
- ❌ Medical data
- ❌ Sensitive financial information
- ❌ Payment data (handled by third-party processors)

### 5.2 Access and Authorization

#### Authorized Access
- ✅ Users access their own data
- ✅ Admins access system data (logs, metrics)
- ✅ Internal services communicate via authenticated APIs

#### Unauthorized Access
- ❌ Direct database access from outside
- ❌ Data sharing between users
- ❌ Access without authentication

---

## 6. Performance Boundaries

### 6.1 Guarantees

#### Response Time
- ✅ Simple questions: < 3 seconds
- ✅ Complex questions: < 10 seconds
- ✅ Interface: < 2 seconds to load

#### Scalability
- ✅ Support 1000+ concurrent users
- ✅ Horizontal scalability
- ✅ Automatic load balancing

### 6.2 Limitations

#### Technical Limitations
- ⚠️ Depends on availability of external services (AI, TTS)
- ⚠️ Performance depends on network latency (standard) or local hardware (open source)
- ⚠️ Resource usage can limit large-scale usage (open source)

#### Functional Limitations
- ⚠️ Response quality depends on the AI models used
- ⚠️ Availability depends on services (cloud or local infrastructure)

---

## 7. Cost/Resource Boundaries

### 7.1 Optimization

#### Implemented Strategies
- ✅ Prioritize cost-effective/performance models
- ✅ Cache frequent responses
- ✅ Intelligent scaling (advanced models when needed)
- ✅ Precise usage tracking

### 7.2 Limitations

#### External Costs/Resources
**Standard Version**:
- ⚠️ AI service costs (OpenAI, Anthropic)
- ⚠️ Voice service costs (ElevenLabs, Azure)
- ⚠️ Cloud infrastructure costs
- ⚠️ Vector database costs

**Open Source Version**:
- ⚠️ Infrastructure costs (servers)
- ⚠️ Resource usage (CPU, GPU, memory)
- ⚠️ Infrastructure maintenance

#### Control
- ✅ The system can limit usage per user
- ✅ The system can cache to reduce calls
- ❌ The system does not control external service pricing (standard)
- ❌ The system does not control hardware limits (open source)

---

## 8. Integration Boundaries

### 8.1 Supported Integrations

#### Frontend
- ✅ Vanilla JavaScript/TypeScript integration
- ✅ React integration
- ✅ SDK integration
- ✅ Widget integration

#### Backend
- ✅ REST APIs
- ✅ WebSocket for real-time
- ✅ Webhooks (future)

### 8.2 Integration Limitations

#### Not Currently Supported
- ❌ Native mobile integration (separate SDK required)
- ❌ Integration with specific legacy systems
- ❌ ERP/CRM integration (future)

---

## 9. Evolving Boundaries

### 9.1 Possible Future Extensions

#### Potential Features
- 🔮 Multi-language support
- 🔮 Calendar integration for reminders
- 🔮 Advanced user analytics
- 🔮 Public API for third-party developers
- 🔮 Model fine-tuning for the well-being domain

### 9.2 Evolution Constraints

#### Constraints
- ⚠️ Evolution depends on AI model capabilities
- ⚠️ Evolution depends on budgets and resources
- ⚠️ Evolution must respect domain boundaries (no medical)

---

## 10. Decision Rules

### 10.1 When to Add a Feature

**ADD if**:
- ✅ Fits within the well-being domain
- ✅ Improves user experience
- ✅ Respects security boundaries
- ✅ Is technically feasible
- ✅ Respects budget/resources

**DO NOT ADD if**:
- ❌ Out of the well-being domain (without redirection)
- ❌ Involves sensitive medical data
- ❌ Compromises security
- ❌ Prohibitive cost/resource use
- ❌ Excessive technical complexity

### 10.2 When to Redirect

**REDIRECT to a professional if**:
- ⚠️ Medical question detected
- ⚠️ Complex legal question
- ⚠️ Financial question requiring expertise
- ⚠️ Question outside the well-being domain

---

## 11. Boundary Examples in Action

### 11.1 Example 1: Well-being Question ✅

**Question**: "How can I improve my meditation practice?"

**System Response**:
- ✅ Handles the question (in scope)
- ✅ Provides meditation advice
- ✅ May recommend books
- ✅ Stores in history

### 11.2 Example 2: Medical Question ⚠️

**Question**: "I've had a headache for 3 days, what should I do?"

**System Response**:
- ⚠️ Detects a medical question
- ⚠️ Responds with disclaimer: "I am not a healthcare professional..."
- ⚠️ Redirects to a doctor
- ⚠️ Does NOT record medical diagnosis or advice

### 11.3 Example 3: Out-of-Scope Question ❌

**Question**: "How do I start a company?"

**System Response**:
- ❌ Detects it's out of the well-being domain
- ❌ Responds politely: "I focus on well-being..."
- ❌ May redirect to appropriate resources
- ❌ Does not store as a well-being conversation

---

## 12. Boundary Maintenance

### 12.1 Periodic Review

- **Frequency**: Quarterly
- **Participants**: Engineering team, product owner
- **Goal**: Ensure boundaries remain appropriate

### 12.2 Documentation

- **Updates**: On major changes
- **Versioning**: Track versions of this document
- **Communication**: Share with the whole team

---

## 13. Conclusion

The boundaries defined in this document ensure that:
- ✅ The system remains focused on its domain (well-being)
- ✅ Security and privacy are respected
- ✅ Users receive appropriate responses
- ✅ The system can evolve in a controlled way
- ✅ Costs/resources are managed

These boundaries must be respected when developing new features, regardless of version (standard or open source).

---

**Note**: These boundaries are shared across both versions. Technical implementations may differ, but functional and domain limits remain the same.
