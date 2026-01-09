# Architecture Decision Log (ADR) - Commun

## Version: 1.0
## Date: 09.01.2026

Ce document enregistre les décisions architecturales communes importantes prises pour le projet Serein. Certaines décisions peuvent avoir des implémentations différentes selon la version (standard vs open source).

---

## Format

Chaque ADR suit ce format:
- **Statut**: Proposé / Accepté / Rejeté / Déprécié
- **Contexte**: Pourquoi cette décision est nécessaire
- **Décision**: La décision prise
- **Conséquences**: Impact de cette décision
- **Note Version**: Différences d'implémentation selon la version

---

## ADR-001: Architecture Microservices

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Le système doit être scalable, maintenable et permettre le déploiement indépendant des composants.

### Décision
Adopter une architecture microservices avec:
- Services indépendants (auth, user, conversation, AI, content, voice)
- Communication via APIs REST
- Chaque service avec sa propre base de données
- API Gateway pour le routage

### Conséquences
- ✅ Scalabilité horizontale facilitée
- ✅ Déploiement indépendant
- ✅ Isolation des erreurs
- ⚠️ Complexité opérationnelle accrue
- ⚠️ Nécessite orchestration (Kubernetes)

### Note Version
- **Standard**: API Gateway Kong
- **Open Source**: API Gateway Nginx/Traefik

---

## ADR-002: TypeScript pour Tout le Code

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de maintenabilité, typage fort, et meilleure DX (Developer Experience).

### Décision
Utiliser TypeScript pour:
- Tous les services backend
- Toutes les applications frontend
- Le SDK

### Conséquences
- ✅ Typage statique réduit les erreurs
- ✅ Meilleure autocomplétion IDE
- ✅ Refactoring plus sûr
- ⚠️ Courbe d'apprentissage pour certains développeurs
- ⚠️ Temps de compilation

---

## ADR-003: PostgreSQL comme Base de Données Principale

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin d'une base de données relationnelle robuste pour les données structurées (users, conversations, messages).

### Décision
Utiliser PostgreSQL 15+ comme base de données principale avec Prisma comme ORM.

### Conséquences
- ✅ Robuste et fiable
- ✅ Support des transactions ACID
- ✅ Écosystème riche
- ✅ Prisma offre excellent DX
- ⚠️ Nécessite gestion de migrations
- ⚠️ Scaling vertical plus que horizontal (sans sharding)

---

## ADR-004: Redis pour Cache et Sessions

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de performance pour cache et gestion de sessions.

### Décision
Utiliser Redis pour:
- Cache des réponses IA fréquentes
- Gestion des sessions utilisateur
- Rate limiting
- Message queue (pub/sub)

### Conséquences
- ✅ Performance élevée
- ✅ Structures de données riches
- ✅ Support pub/sub natif
- ⚠️ Données volatiles (nécessite persistance si critique)
- ⚠️ Nécessite gestion de la mémoire

---

## ADR-005: Multi-Provider pour Services IA

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de flexibilité, réduction des risques de vendor lock-in, et optimisation des coûts/ressources.

### Décision
Supporter plusieurs providers IA avec abstraction pour faciliter l'ajout de nouveaux providers.

### Conséquences
- ✅ Flexibilité dans le choix de provider
- ✅ Réduction du risque de dépendance
- ✅ Optimisation des coûts/ressources possible
- ⚠️ Complexité d'abstraction
- ⚠️ Nécessite tests pour chaque provider

### Note Version
- **Standard**: OpenAI, Anthropic (cloud)
- **Open Source**: Ollama avec modèles multiples (Llama, Mistral, Phi)

---

## ADR-006: Orchestration Intelligente des Modèles IA

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin d'optimiser les coûts/ressources tout en maintenant la qualité des réponses.

### Décision
Implémenter une logique d'orchestration:
- Commencer avec modèles économiques/performants
- Monter en charge vers modèles avancés si question complexe
- Évaluer la complexité avant de choisir le modèle

### Conséquences
- ✅ Optimisation des coûts/ressources
- ✅ Qualité maintenue pour questions complexes
- ⚠️ Logique d'évaluation de complexité à maintenir
- ⚠️ Nécessite monitoring de l'utilisation

### Note Version
- **Standard**: GPT-3.5 → GPT-4 (optimisation coûts)
- **Open Source**: Phi/Mistral 7B → Llama 2 70B (optimisation ressources)

---

## ADR-007: Limitation Stricte au Domaine Bien-être

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Responsabilité légale et éthique: éviter les conseils médicaux ou hors domaine.

### Décision
Implémenter des filtres de domaine:
- Détection automatique des questions médicales
- Redirection vers professionnels pour questions médicales
- Limitation stricte au domaine bien-être/philosophie/spiritualité

### Conséquences
- ✅ Réduction des risques légaux
- ✅ Focus sur le domaine d'expertise
- ✅ Protection des utilisateurs
- ⚠️ Nécessite logique de détection robuste
- ⚠️ Peut frustrer certains utilisateurs

---

## ADR-008: API Gateway pour Routage et Sécurité

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de centraliser l'authentification, rate limiting, et routage.

### Décision
Utiliser un API Gateway:
- Routage vers services backend
- Authentification centralisée
- Rate limiting
- Logging centralisé

### Conséquences
- ✅ Sécurité centralisée
- ✅ Gestion du trafic facilitée
- ✅ Point d'entrée unique
- ⚠️ Point de défaillance unique (nécessite HA)
- ⚠️ Latence additionnelle (minime)

### Note Version
- **Standard**: Kong
- **Open Source**: Nginx / Traefik

---

## ADR-009: JWT pour Authentification

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin d'authentification stateless, scalable, et sécurisée.

### Décision
Utiliser JWT (JSON Web Tokens) pour:
- Tokens d'accès (courte durée: 15 min)
- Refresh tokens (longue durée: 7 jours)
- Validation côté API Gateway

### Conséquences
- ✅ Stateless (scalable)
- ✅ Pas besoin de session store pour tokens
- ✅ Standard de l'industrie
- ⚠️ Tokens non révocables avant expiration (nécessite blacklist si besoin)
- ⚠️ Taille des tokens (limite si beaucoup de claims)

---

## ADR-010: Vector Database pour Recherche Sémantique

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de recherche sémantique dans les livres et contenus pour recommandations.

### Décision
Utiliser une vector database pour:
- Stockage des embeddings de livres
- Recherche sémantique
- Recommandations basées sur similarité

### Conséquences
- ✅ Recherche sémantique performante
- ✅ Scalabilité
- ✅ Facile à utiliser
- ⚠️ Coûts à grande échelle (version standard)
- ⚠️ Maintenance requise (version open source)

### Note Version
- **Standard**: Pinecone (cloud)
- **Open Source**: Weaviate / Qdrant (self-hosted)

---

## ADR-011: React pour Frontend

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin d'une interface utilisateur moderne, réactive, et maintenable.

### Décision
Utiliser React 18+ avec:
- TypeScript
- Vite pour build
- Tailwind CSS pour styling
- React Query pour data fetching

### Conséquences
- ✅ Écosystème riche
- ✅ Grande communauté
- ✅ Performance avec React 18
- ⚠️ Courbe d'apprentissage
- ⚠️ Nécessite gestion d'état (Zustand/React Query)

---

## ADR-012: Docker pour Containerisation

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de reproductibilité, isolation, et facilité de déploiement.

### Décision
Utiliser Docker pour:
- Containerisation de tous les services
- Docker Compose pour développement local
- Kubernetes pour production

### Conséquences
- ✅ Environnements reproductibles
- ✅ Isolation des services
- ✅ Facilité de déploiement
- ⚠️ Courbe d'apprentissage Docker
- ⚠️ Nécessite gestion des images

---

## ADR-013: Structured Logging avec JSON

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de logs structurés pour faciliter l'analyse et le monitoring.

### Décision
Utiliser Pino pour logging:
- Format JSON structuré
- Niveaux de log appropriés
- Centralisation avec ELK ou Loki

### Conséquences
- ✅ Logs facilement analysables
- ✅ Intégration avec outils de monitoring
- ✅ Performance (Pino est très rapide)
- ⚠️ Nécessite infrastructure de centralisation
- ⚠️ Taille des logs (JSON plus volumineux)

### Note Version
- **Standard**: ELK Stack ou Datadog Logs
- **Open Source**: Loki + Promtail

---

## ADR-014: Monitoring

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de visibilité sur les performances, erreurs, et santé du système.

### Décision
Utiliser des outils de monitoring pour:
- Métriques de performance
- Error tracking
- Distributed tracing

### Conséquences
- ✅ Visibilité complète du système
- ✅ Détection rapide des problèmes
- ✅ Métriques de performance
- ⚠️ Coûts (version standard)
- ⚠️ Nécessite configuration et maintenance

### Note Version
- **Standard**: Datadog, Sentry Cloud
- **Open Source**: Prometheus + Grafana, Sentry Self-hosted, Jaeger

---

## ADR-015: SDK JavaScript/TypeScript pour Intégration

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de faciliter l'intégration dans différents environnements (web, mobile, widgets).

### Décision
Créer un SDK officiel:
- JavaScript/TypeScript
- Support ES modules et CommonJS
- Documentation complète
- Exemples d'utilisation

### Conséquences
- ✅ Facilité d'intégration
- ✅ Adoption facilitée
- ✅ Support centralisé
- ⚠️ Nécessite maintenance du SDK
- ⚠️ Versioning à gérer

---

## ADR-016: Tests avec Couverture Minimale de 80%

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de qualité de code et confiance dans les déploiements.

### Décision
Exiger:
- Couverture minimale de 80%
- Tests unitaires pour logique métier
- Tests d'intégration pour APIs
- Tests E2E pour scénarios critiques

### Conséquences
- ✅ Qualité de code améliorée
- ✅ Confiance dans les changements
- ✅ Documentation vivante (tests)
- ⚠️ Temps de développement augmenté
- ⚠️ Maintenance des tests

---

## ADR-017: CI/CD avec GitHub Actions

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin d'automatisation des tests et déploiements.

### Décision
Utiliser GitHub Actions pour:
- Tests automatiques sur PR
- Linting et formatage
- Déploiement automatique (staging/production)
- Génération de documentation

### Conséquences
- ✅ Automatisation complète
- ✅ Intégré à GitHub
- ✅ Gratuit pour open-source
- ⚠️ Nécessite configuration
- ⚠️ Limites sur les minutes gratuites

---

## ADR-018: Prisma comme ORM

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin d'un ORM type-safe, avec migrations, et excellent DX.

### Décision
Utiliser Prisma comme ORM:
- Type-safety avec TypeScript
- Migrations automatiques
- Excellent tooling (Prisma Studio)
- Support PostgreSQL natif

### Conséquences
- ✅ Type-safety excellent
- ✅ Migrations faciles
- ✅ DX exceptionnelle
- ⚠️ Courbe d'apprentissage
- ⚠️ Génération de code nécessaire

---

## ADR-019: WebSocket pour Conversations Temps Réel

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de conversations fluides en temps réel, surtout pour mode vocal.

### Décision
Utiliser WebSocket pour:
- Conversations en temps réel
- Streaming des réponses IA
- Mise à jour de l'état de conversation

### Conséquences
- ✅ Expérience utilisateur fluide
- ✅ Réponses en streaming
- ✅ Réactivité améliorée
- ⚠️ Complexité de gestion des connexions
- ⚠️ Nécessite gestion de reconnexion

---

## ADR-020: Rate Limiting par Utilisateur

**Statut**: Accepté  
**Date**: 09.01.2026

### Contexte
Besoin de protéger le système contre abus et contrôler les coûts/ressources.

### Décision
Implémenter rate limiting:
- Par utilisateur authentifié
- Par IP pour endpoints publics
- Configurable par endpoint
- Utilisation de Redis pour compteurs

### Conséquences
- ✅ Protection contre abus
- ✅ Contrôle des coûts/ressources
- ✅ Équité d'usage
- ⚠️ Peut bloquer utilisateurs légitimes si mal configuré
- ⚠️ Nécessite tuning des limites

---

## Notes

- Les ADRs sont des documents vivants et peuvent être mis à jour
- Les décisions peuvent être révisées si le contexte change
- Toute nouvelle décision architecturale importante doit être documentée ici
- Les différences d'implémentation entre versions sont notées dans chaque ADR

---

**Note**: Ce document décrit les décisions communes. Pour les décisions spécifiques à chaque version, voir les ADRs dans la documentation de chaque version.
