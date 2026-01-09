# Architecture Système Open Source - Serein

## Version: 1.0
## Date: 09.01.2026

---

## 1. Vue d'Ensemble

Cette architecture utilise **uniquement des technologies open source** pour permettre un déploiement self-hosted complet.

### 1.1 Principes Architecturaux

- **Microservices**: Architecture modulaire avec services indépendants
- **Open Source First**: Toutes les technologies sont open source
- **Self-Hosted**: Déploiement possible sur votre propre infrastructure
- **Cost-Effective**: Pas de coûts de services cloud propriétaires
- **Security by Design**: Sécurité intégrée, code auditable

### 1.2 Diagramme de Haut Niveau

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

## 2. Services Backend (Open Source)

### 2.1 Auth Service

**Technologies**: Node.js, Express, JWT, bcrypt
**Base de données**: PostgreSQL
**APIs**: Identiques à la version standard

### 2.2 User Service

**Technologies**: Node.js, Express, Prisma
**Base de données**: PostgreSQL
**APIs**: Identiques à la version standard

### 2.3 Conversation Service

**Technologies**: Node.js, Express, Prisma
**Base de données**: PostgreSQL
**APIs**: Identiques à la version standard

### 2.4 AI Service (Open Source)

**Technologies**: Node.js, Express
**LLM Provider**: Ollama (local ou serveur dédié)
**Modèles supportés**:
- Llama 2/3 (Meta)
- Mistral (Mistral AI)
- Phi (Microsoft)
- CodeLlama (Meta)

**Logique de Sélection**:
1. Évaluer la complexité de la question
2. Utiliser un modèle léger pour questions simples (Phi, Mistral 7B)
3. Utiliser un modèle plus puissant pour questions complexes (Llama 70B, Mistral Large)
4. Pas de coût par token (gratuit)

**APIs**:
- `POST /ai/chat` - Chat avec l'agent IA
- `POST /ai/chat/stream` - Chat en streaming
- `GET /ai/models` - Liste des modèles disponibles (Ollama)

### 2.5 Content Service

**Technologies**: Node.js, Express
**Vector Database**: Weaviate (open source, self-hosted)
**Base de données**: PostgreSQL

**APIs**:
- `POST /content/search` - Rechercher des ouvrages (recherche sémantique via Weaviate)
- `GET /content/books` - Liste des livres disponibles
- `GET /content/books/:id` - Détails d'un livre
- `POST /content/recommendations` - Recommandations basées sur les croyances

### 2.6 Voice Service (Open Source)

**Technologies**: Node.js, Express
**TTS**: Coqui TTS ou Piper TTS
**STT**: Whisper (via API REST)

**APIs**:
- `POST /voice/synthesize` - Synthèse vocale (Coqui TTS)
- `POST /voice/transcribe` - Transcription vocale (Whisper)
- `GET /voice/voices` - Liste des voix disponibles

**Déploiement**:
- Coqui TTS: Service Python avec API REST
- Whisper: Service Python avec API REST (faster-whisper)

---

## 3. Infrastructure Open Source

### 3.1 API Gateway

**Nginx** ou **Traefik**
- Routage vers services backend
- Authentification centralisée
- Rate limiting
- Load balancing
- SSL/TLS termination

### 3.2 Container Orchestration

**Kubernetes** (open source)
- Orchestration des services
- Auto-scaling
- Service discovery
- Health checks

**Alternative**: Docker Compose (pour développement)

### 3.3 Monitoring Stack

**Prometheus**
- Collecte de métriques
- Alerting
- Time-series database

**Grafana**
- Visualisation des métriques
- Dashboards
- Alerting

**Loki + Promtail**
- Collecte de logs
- Centralisation
- Requêtes similaires à Prometheus

**Jaeger**
- Distributed tracing
- Compatible OpenTelemetry

---

## 4. Base de Données Open Source

### 4.1 PostgreSQL

**Utilisation**: Base de données principale
**Version**: 15+
**ORM**: Prisma (open source)

### 4.2 Redis

**Utilisation**: Cache, sessions, rate limiting
**Version**: 7.0+

### 4.3 Weaviate

**Utilisation**: Base de données vectorielle pour recherche sémantique
**Déploiement**: Self-hosted
**Alternatives**: Qdrant, Milvus

---

## 5. Services IA Open Source

### 5.1 Ollama (LLM)

**Déploiement**:
- Local sur serveur dédié
- Via Docker
- API REST compatible OpenAI

**Modèles**:
- **Léger**: Phi-2, Mistral 7B
- **Moyen**: Llama 2 13B, Mistral Medium
- **Puissant**: Llama 2 70B, Mistral Large

**Performance**:
- GPU recommandé pour modèles > 7B
- CPU possible pour modèles < 7B

### 5.2 Coqui TTS

**Déploiement**:
- Service Python avec API REST
- Via Docker
- Support de multiples voix

**Alternatives**:
- Piper TTS (plus léger)
- Mozilla TTS

### 5.3 Whisper

**Déploiement**:
- Service Python avec API REST
- Via Docker
- faster-whisper pour performance

**Modèles**:
- tiny, base, small, medium, large
- Support multi-langues

---

## 6. Différences avec la Version Standard

### 6.1 Services IA

| Composant | Standard | Open Source |
|-----------|----------|-------------|
| LLM | OpenAI/Anthropic (cloud) | Ollama (local) |
| TTS | ElevenLabs (cloud) | Coqui TTS (local) |
| STT | Azure Speech (cloud) | Whisper (local) |
| Vector DB | Pinecone (cloud) | Weaviate (local) |

### 6.2 Infrastructure

| Composant | Standard | Open Source |
|-----------|----------|-------------|
| API Gateway | Kong Cloud | Nginx/Traefik |
| Monitoring | Datadog | Prometheus + Grafana |
| Logging | Datadog | Loki |
| Error Tracking | Sentry Cloud | Sentry Self-hosted |

### 6.3 Coûts

| Type | Standard | Open Source |
|------|----------|-------------|
| Services IA | $500-2000/mois | $0 (local) |
| Infrastructure | $100-500/mois | $50-200/mois (serveurs) |
| **Total** | **$600-2500/mois** | **$50-200/mois** |

---

## 7. Déploiement Self-Hosted

### 7.1 Architecture Self-Hosted

```
┌─────────────────────────────────────────┐
│      Votre Serveur / Infrastructure     │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │     Kubernetes / Docker Compose  │  │
│  │                                   │  │
│  │  Services Backend (Node.js)       │  │
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

### 7.2 Exigences Système

**Minimum**:
- CPU: 8 cores
- RAM: 32 GB
- Storage: 500 GB SSD
- GPU: Optionnel (recommandé pour LLM)

**Recommandé**:
- CPU: 16+ cores
- RAM: 64+ GB
- Storage: 1 TB+ SSD
- GPU: NVIDIA avec 16+ GB VRAM

---

## 8. Avantages de l'Architecture Open Source

### 8.1 Coûts
- ✅ Pas de coûts de services cloud
- ✅ Coûts limités à l'infrastructure
- ✅ Pas de coûts par token/requête

### 8.2 Contrôle
- ✅ Contrôle total sur les données
- ✅ Pas de vendor lock-in
- ✅ Déploiement où vous voulez

### 8.3 Sécurité
- ✅ Code source auditable
- ✅ Pas de dépendance à services externes
- ✅ Conformité RGPD facilitée

### 8.4 Flexibilité
- ✅ Personnalisation complète
- ✅ Pas de limitations de rate
- ✅ Intégration facile

---

## 9. Conclusion

Cette architecture open source permet de :
- ✅ Réduire les coûts drastiquement
- ✅ Maintenir le contrôle total
- ✅ Déployer en self-hosted
- ✅ Utiliser des technologies de qualité professionnelle
- ✅ Éviter le vendor lock-in

L'architecture est conçue pour être aussi performante que la version standard, tout en étant entièrement open source et self-hostable.
