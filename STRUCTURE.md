# Structure du Projet - Serein Open Source

## Vue d'Ensemble

Cette structure correspond à la Phase 0.1 du roadmap : Infrastructure de Base.

## Structure des Dossiers

```
serein-opensource/
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD GitHub Actions
│
├── docs/                             # Documentation complète
│   ├── architecture/
│   ├── common/
│   ├── deployment/
│   └── ...
│
├── infrastructure/                    # Configurations infrastructure
│   ├── nginx/                        # API Gateway
│   │   ├── nginx.conf
│   │   └── conf.d/
│   │       └── default.conf
│   └── monitoring/                    # Monitoring stack
│       ├── prometheus.yml
│       ├── loki-config.yml
│       ├── promtail-config.yml
│       └── grafana/
│           ├── dashboards/
│           └── datasources/
│
├── services/                          # Microservices backend
│   ├── auth-service/                 # (à créer avec setup-service.sh)
│   ├── user-service/                 # (à créer avec setup-service.sh)
│   ├── conversation-service/         # (à créer avec setup-service.sh)
│   ├── ai-service/                   # (à créer avec setup-service.sh)
│   ├── content-service/              # (à créer avec setup-service.sh)
│   └── voice-service/                # (à créer avec setup-service.sh)
│
├── frontend/                          # Applications frontend
│   ├── web/                          # Application web React (à créer)
│   └── sdk/                          # SDK JavaScript/TypeScript (à créer)
│
├── shared/                            # Code partagé
│   ├── types/
│   │   └── index.ts                  # Types TypeScript partagés
│   ├── utils/
│   │   ├── logger.ts                 # Logger Pino
│   │   └── errors.ts                 # Classes d'erreurs
│   ├── index.ts                      # Exports principaux
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── scripts/                           # Scripts utilitaires
│   └── setup-service.sh              # Script de création de service
│
├── .eslintrc.base.json               # Configuration ESLint de base
├── .eslintrc.json                    # ESLint root (étend base)
├── .prettierrc.base.json            # Configuration Prettier de base
├── .prettierrc                       # Prettier root
├── .prettierignore                   # Fichiers ignorés par Prettier
├── .gitignore                        # Fichiers ignorés par Git
│
├── tsconfig.base.json                # Configuration TypeScript de base
├── tsconfig.json                     # TypeScript root (étend base)
│
├── package.json                      # Configuration monorepo
├── docker-compose.yml                # Services Docker
├── env.example                       # Variables d'environnement exemple
├── jest.config.js                    # Configuration Jest
│
├── README.md                         # Documentation principale
├── README-SETUP.md                   # Guide de setup
├── CHANGELOG.md                      # Historique des versions
└── CONTRIBUTING.md                   # Guide de contribution
```

## Fichiers de Configuration

### Configuration TypeScript
- ✅ `tsconfig.base.json` - Configuration de base pour tous les services
- ✅ `tsconfig.json` - Configuration root (étend base)
- ✅ `shared/tsconfig.json` - Configuration package shared

### Configuration ESLint
- ✅ `.eslintrc.base.json` - Règles ESLint de base
- ✅ `.eslintrc.json` - Configuration root (étend base)
- ✅ `shared/.eslintrc.json` - Configuration shared

### Configuration Prettier
- ✅ `.prettierrc.base.json` - Configuration Prettier de base
- ✅ `.prettierrc` - Configuration root
- ✅ `.prettierignore` - Fichiers ignorés
- ✅ `shared/.prettierrc` - Configuration shared

### Infrastructure
- ✅ `docker-compose.yml` - Services Docker complets
- ✅ `infrastructure/nginx/nginx.conf` - Configuration Nginx
- ✅ `infrastructure/nginx/conf.d/default.conf` - Routes API Gateway
- ✅ `infrastructure/monitoring/prometheus.yml` - Configuration Prometheus
- ✅ `infrastructure/monitoring/loki-config.yml` - Configuration Loki
- ✅ `infrastructure/monitoring/promtail-config.yml` - Configuration Promtail
- ✅ `infrastructure/monitoring/grafana/datasources/prometheus.yml` - Datasource Prometheus
- ✅ `infrastructure/monitoring/grafana/dashboards/dashboard.yml` - Provisioning dashboards

### CI/CD
- ✅ `.github/workflows/ci.yml` - Pipeline CI GitHub Actions

### Scripts
- ✅ `scripts/setup-service.sh` - Script de création de service

### Package Shared
- ✅ `shared/types/index.ts` - Types TypeScript partagés
- ✅ `shared/utils/logger.ts` - Logger Pino
- ✅ `shared/utils/errors.ts` - Classes d'erreurs
- ✅ `shared/index.ts` - Exports principaux
- ✅ `shared/package.json` - Configuration package
- ✅ `shared/README.md` - Documentation

## État de Création

### ✅ Créés et Configurés
- [x] Structure monorepo
- [x] Configurations TypeScript (base + root)
- [x] Configurations ESLint (base + root)
- [x] Configurations Prettier (base + root)
- [x] Infrastructure Nginx (API Gateway)
- [x] Infrastructure Monitoring (Prometheus, Grafana, Loki)
- [x] Package Shared (types, utils)
- [x] Scripts utilitaires
- [x] CI/CD GitHub Actions
- [x] Documentation de setup

### ⏳ À Créer (via setup-service.sh ou manuellement)
- [ ] Services backend (6 services)
  - [ ] auth-service
  - [ ] user-service
  - [ ] conversation-service
  - [ ] ai-service
  - [ ] content-service
  - [ ] voice-service
- [ ] Frontend
  - [ ] web (React app)
  - [ ] sdk (JavaScript/TypeScript SDK)

## Commandes Utiles

### Créer un nouveau service
```bash
npm run setup:service <service-name> <port>
```

### Installer les dépendances
```bash
npm install
```

### Démarrer les services Docker
```bash
npm run docker:up
```

### Build le package shared
```bash
npm run build:shared
```

## Prochaines Étapes

1. ✅ Phase 0.1: Infrastructure de Base - **TERMINÉE**
2. ⏭️ Phase 1: Services de Base (Auth & User)
3. ⏭️ Phase 2: Services Conversation & IA
4. ⏭️ Phase 3: Services Vocaux
5. ⏭️ Phase 4: Frontend

Voir [ROADMAP.md](docs/ROADMAP.md) pour plus de détails.
