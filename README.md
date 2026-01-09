# Serein - Version Open Source

Plateforme IA de bien-être construite exclusivement avec des outils et technologies open source.

## 🎯 Philosophie Open Source

Cette version de Serein utilise uniquement des technologies open source pour :
- ✅ Réduire les coûts d'infrastructure
- ✅ Éviter le vendor lock-in
- ✅ Permettre le déploiement self-hosted
- ✅ Maintenir la transparence et la sécurité

## 📋 Documentation

Cette version est **complètement autonome** avec sa propre documentation et historique.

### Documentation Principale

- **[README-SETUP.md](README-SETUP.md)** - Guide complet de setup et configuration
- **[STRUCTURE.md](STRUCTURE.md)** - Structure détaillée du projet
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Index complet de la documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Historique complet des versions (Semantic Versioning)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guide de contribution

### Documentation Technique

- **[Index de la Documentation](docs/README.md)** - Vue d'ensemble de la documentation
- **[Roadmap de Développement](docs/ROADMAP.md)** - Feuille de route complète
- **[Architecture Système Open Source](docs/architecture/system-architecture.md)** - Architecture avec services open source
- **[Stack Technologique Open Source](docs/technology-stack.md)** - Technologies open source
- **[Guide de Déploiement Self-Hosted](docs/deployment/self-hosted.md)** - Guide complet
- **[Comparaison Standard vs Open Source](docs/comparison.md)** - Comparaison détaillée

### Documentation Commune (Référencée)

- [Exigences Fonctionnelles](docs/common/requirements/functional-requirements.md) - 56 exigences
- [Exigences Non-Fonctionnelles](docs/common/requirements/non-functional-requirements.md) - 76 exigences
- [Architecture de Base](docs/common/architecture/system-architecture.md) - Architecture commune
- [Boundaries](docs/common/architecture/boundaries.md) - Limites du système
- [Decision Log (ADR)](docs/common/architecture/decision-log.md) - Décisions architecturales
- [Stratégie de Tests](docs/common/testing/test-strategy.md) - Stratégie complète

## 🏗️ Structure du Projet

```
serein-opensource/
├── docs/                    # Documentation
│   ├── requirements/        # Exigences
│   ├── architecture/        # Architecture open source
│   └── deployment/          # Guides de déploiement
├── services/                # Microservices backend
│   ├── auth-service/        # Service d'authentification
│   ├── user-service/        # Service de gestion des utilisateurs
│   ├── conversation-service/# Service de conversation
│   ├── ai-service/          # Service d'orchestration IA (open source)
│   ├── content-service/     # Service de recherche de contenu
│   └── voice-service/       # Service de synthèse vocale (open source)
├── frontend/                # Application frontend
│   ├── web/                 # Application web React
│   └── sdk/                 # SDK JavaScript/TypeScript
├── infrastructure/          # Infrastructure as Code
│   ├── docker/              # Configurations Docker
│   ├── kubernetes/          # Configurations Kubernetes
│   └── terraform/           # Configurations Terraform
└── tests/                   # Tests
    ├── unit/                # Tests unitaires
    ├── integration/         # Tests d'intégration
    └── e2e/                 # Tests end-to-end
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20 LTS+
- Docker et Docker Compose
- PostgreSQL 15+ (ou alternative open source)
- Redis 7.0+
- Modèle LLM open source (Llama, Mistral, etc.)

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/serein-opensource.git
cd serein-opensource

# Installer les dépendances
npm install

# Démarrer les services avec Docker Compose
docker-compose up -d

# Lancer les migrations
npm run migrate

# Démarrer l'application
npm run dev
```

## 🛠️ Stack Technologique Open Source

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

### IA (100% Open Source)
- **LLM**: Ollama (Llama, Mistral, Phi)
- **TTS**: Coqui TTS / Piper TTS
- **STT**: Whisper (OpenAI, mais open source)

### Infrastructure
- Docker
- Kubernetes
- Nginx / Traefik (API Gateway)
- Prometheus + Grafana (Monitoring)
- Loki + Promtail (Logging)
- Jaeger (Tracing)

### Base de Données
- PostgreSQL (relationnelle)
- Redis (cache)
- Weaviate / Qdrant (vector database)

## 🔐 Sécurité

- Authentification JWT
- Chiffrement des données (TLS, chiffrement au repos)
- Rate limiting
- Validation des entrées
- Conformité RGPD

## 📊 Monitoring (Open Source)

- Logging structuré (Pino → Loki)
- Métriques (Prometheus)
- Visualisation (Grafana)
- Error tracking (Sentry self-hosted ou alternative)
- Distributed tracing (Jaeger)

## 💰 Coûts

Avec cette stack open source :
- ✅ Pas de coûts de services cloud propriétaires
- ✅ Déploiement self-hosted possible
- ✅ Coûts limités à l'infrastructure (serveurs)
- ✅ Modèles IA locaux (pas de coûts par token)

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 🔄 Différences avec la Version Standard

| Composant | Version Standard | Version Open Source |
|-----------|----------------|---------------------|
| LLM | OpenAI / Anthropic | Ollama (Llama/Mistral) |
| TTS | ElevenLabs | Coqui TTS / Piper |
| STT | Azure Speech | Whisper |
| Vector DB | Pinecone | Weaviate / Qdrant |
| API Gateway | Kong | Nginx / Traefik |
| Monitoring | Datadog | Prometheus + Grafana |
| Error Tracking | Sentry Cloud | Sentry Self-hosted |

---

**Note**: Cette version est optimisée pour le déploiement self-hosted et l'utilisation de technologies open source.
