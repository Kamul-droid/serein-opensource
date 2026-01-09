# Setup Guide - Phase 0.1 Infrastructure

Ce guide explique comment mettre en place l'infrastructure de base pour Serein Open Source.

## Prérequis

- Node.js 20 LTS+
- Docker 24.0+ et Docker Compose 2.0+
- Git

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/your-org/serein-opensource.git
cd serein-opensource
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

```bash
cp env.example .env
# Éditer .env avec vos configurations
```

### 4. Démarrer les services Docker

```bash
# Démarrer tous les services
npm run docker:up

# Vérifier les services
npm run docker:ps

# Voir les logs
npm run docker:logs
```

### 5. Initialiser Ollama (LLM)

```bash
# Télécharger un modèle (ex: Mistral 7B - plus léger)
npm run ollama:pull mistral

# Ou Llama 2 (plus puissant, nécessite plus de RAM)
npm run ollama:pull llama2

# Vérifier les modèles disponibles
npm run ollama:list
```

### 6. Vérifier Weaviate

```bash
curl http://localhost:8080/v1/.well-known/ready
```

## Structure du Projet

```
serein-opensource/
├── services/              # Microservices backend
│   ├── auth-service/
│   ├── user-service/
│   ├── conversation-service/
│   ├── ai-service/
│   ├── content-service/
│   └── voice-service/
├── frontend/              # Applications frontend
│   ├── web/              # Application web React
│   └── sdk/              # SDK JavaScript/TypeScript
├── shared/                # Code partagé
│   ├── types/            # Types TypeScript partagés
│   └── utils/            # Utilitaires partagés
├── infrastructure/        # Configurations infrastructure
│   ├── nginx/            # Configuration API Gateway
│   └── monitoring/       # Prometheus, Grafana, Loki
├── scripts/              # Scripts utilitaires
└── docker-compose.yml    # Configuration Docker Compose
```

## Créer un Nouveau Service

Utilisez le script de setup pour créer un nouveau service avec la structure standard :

```bash
npm run setup:service <service-name> <port>
```

Exemple :
```bash
npm run setup:service auth-service 3001
```

## Services Docker

### Services de Base de Données
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Weaviate**: `localhost:8080`

### Services IA
- **Ollama**: `localhost:11434`
- **Coqui TTS**: `localhost:5002`
- **Whisper**: `localhost:5003`

### Services Monitoring
- **Prometheus**: `localhost:9090`
- **Grafana**: `localhost:3001` (admin/admin)
- **Loki**: `localhost:3100`

### API Gateway
- **Nginx**: `localhost:80`

## Scripts Disponibles

### Développement
- `npm run dev` - Démarrer tous les services en mode développement
- `npm run build` - Build tous les workspaces
- `npm run build:shared` - Build le package shared

### Tests
- `npm run test` - Lancer tous les tests
- `npm run test:unit` - Tests unitaires uniquement
- `npm run test:integration` - Tests d'intégration uniquement
- `npm run test:coverage` - Tests avec couverture

### Qualité de Code
- `npm run lint` - Linter le code
- `npm run lint:fix` - Linter et corriger automatiquement
- `npm run format` - Formater le code
- `npm run format:check` - Vérifier le formatage

### Docker
- `npm run docker:up` - Démarrer tous les services
- `npm run docker:down` - Arrêter tous les services
- `npm run docker:logs` - Voir les logs
- `npm run docker:build` - Build les images
- `npm run docker:restart` - Redémarrer les services
- `npm run docker:ps` - Voir l'état des services

### Ollama
- `npm run ollama:pull <model>` - Télécharger un modèle
- `npm run ollama:list` - Lister les modèles disponibles

## Configuration TypeScript

Chaque service utilise `tsconfig.base.json` comme base et peut l'étendre avec ses propres configurations.

## Configuration ESLint/Prettier

Les configurations sont centralisées dans :
- `.eslintrc.base.json` - Configuration ESLint de base
- `.prettierrc.base.json` - Configuration Prettier de base

Chaque service peut étendre ces configurations.

## Prochaines Étapes

1. ✅ Infrastructure de base configurée
2. ⏭️ Phase 1: Implémenter Auth Service et User Service
3. ⏭️ Phase 2: Implémenter Conversation Service et AI Service

Voir le [ROADMAP.md](docs/ROADMAP.md) pour plus de détails.

## Troubleshooting

### Port déjà utilisé
Si un port est déjà utilisé, modifiez-le dans `docker-compose.yml` ou arrêtez le service qui l'utilise.

### Ollama ne démarre pas
Vérifiez que vous avez assez de RAM (minimum 8GB recommandé pour Mistral 7B).

### Weaviate ne répond pas
Vérifiez les logs : `docker logs serein-weaviate`

### Services ne communiquent pas
Vérifiez que tous les services sont sur le même réseau Docker (`serein-network`).

## Support

Pour plus d'aide, consultez :
- [Documentation](docs/README.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/architecture/system-architecture.md)
