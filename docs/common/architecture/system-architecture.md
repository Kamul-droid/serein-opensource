# Architecture Système - Plateforme IA de Bien-être

## Version: 1.0
## Date: 09.01.2026

---

## 1. Vue d'Ensemble

Ce document décrit l'architecture de base commune à toutes les versions de Serein. Pour l'architecture spécifique à la version open source, voir [Architecture Système Open Source](../architecture/system-architecture.md).

### 1.1 Principes Architecturaux

- **Microservices**: Architecture modulaire avec services indépendants
- **API-First**: Toutes les fonctionnalités exposées via des APIs REST/GraphQL
- **Event-Driven**: Communication asynchrone entre services via événements
- **Security by Design**: Sécurité intégrée à tous les niveaux
- **Self-Contained**: Chaque version est autonome

---

## 2. Services Backend (Communs)

### 2.1 Auth Service

**Responsabilités**:
- Authentification des utilisateurs
- Gestion des tokens JWT
- Gestion des sessions
- Récupération de mot de passe

**APIs**:
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Renouvellement de token
- `POST /auth/forgot-password` - Récupération de mot de passe

**Base de données**: PostgreSQL (table `users`, `sessions`)

---

### 2.2 User Service

**Responsabilités**:
- Gestion des profils utilisateur
- Gestion des préférences utilisateur
- Gestion des croyances et centres d'intérêt

**APIs**:
- `GET /users/me` - Profil utilisateur actuel
- `PUT /users/me` - Mise à jour du profil
- `GET /users/me/preferences` - Préférences utilisateur
- `PUT /users/me/preferences` - Mise à jour des préférences
- `GET /users/me/beliefs` - Croyances de l'utilisateur
- `PUT /users/me/beliefs` - Mise à jour des croyances

**Base de données**: PostgreSQL (table `user_profiles`, `user_preferences`, `user_beliefs`)

---

### 2.3 Conversation Service

**Responsabilités**:
- Gestion des conversations
- Stockage de l'historique
- Gestion du contexte de conversation
- Orchestration des appels IA

**APIs**:
- `POST /conversations` - Créer une nouvelle conversation
- `GET /conversations` - Liste des conversations
- `GET /conversations/:id` - Détails d'une conversation
- `POST /conversations/:id/messages` - Envoyer un message
- `GET /conversations/:id/messages` - Historique des messages
- `DELETE /conversations/:id` - Supprimer une conversation
- `WebSocket /conversations/:id/stream` - Stream de conversation en temps réel

**Base de données**: PostgreSQL (table `conversations`, `messages`)

---

### 2.4 AI Service

**Responsabilités**:
- Orchestration des modèles IA
- Sélection du modèle approprié (performance/complexité)
- Gestion du contexte de conversation
- Application des limites de domaine (bien-être uniquement)
- Gestion des réponses "je ne sais pas"

**APIs**:
- `POST /ai/chat` - Chat avec l'agent IA
- `POST /ai/chat/stream` - Chat en streaming
- `GET /ai/models` - Liste des modèles disponibles

**Note**: L'implémentation diffère selon la version (services cloud vs open source).

---

### 2.5 Content Service

**Responsabilités**:
- Recherche d'ouvrages de référence
- Gestion de la base de connaissances
- Recherche sémantique dans les contenus

**APIs**:
- `POST /content/search` - Rechercher des ouvrages
- `GET /content/books` - Liste des livres disponibles
- `GET /content/books/:id` - Détails d'un livre
- `POST /content/recommendations` - Recommandations basées sur les croyances

**Base de données**: 
- PostgreSQL (table `books`, `book_categories`)
- Vector DB pour la recherche sémantique

---

### 2.6 Voice Service

**Responsabilités**:
- Gestion de la synthèse vocale (TTS)
- Gestion de la reconnaissance vocale (STT)
- Gestion des préférences de voix

**APIs**:
- `POST /voice/synthesize` - Synthèse vocale
- `POST /voice/transcribe` - Transcription vocale
- `GET /voice/voices` - Liste des voix disponibles

**Note**: L'implémentation diffère selon la version (services cloud vs open source).

---

## 3. Base de Données

### 3.1 PostgreSQL (Base de Données Principale)

**Schéma Principal**:

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

**Utilisations**:
- Cache des sessions utilisateur
- Cache des réponses IA fréquentes
- Cache des résultats de recherche
- Rate limiting

### 3.3 Vector Database (Recherche Sémantique)

**Technologies** (selon version):
- **Version Standard**: Pinecone (cloud)
- **Version Open Source**: Weaviate / Qdrant (self-hosted)

**Utilisations**:
- Recherche sémantique dans les livres
- Recherche de contenu similaire
- Embeddings des conversations

---

## 4. Patterns Architecturaux

### 4.1 Repository Pattern
- Abstraction de l'accès aux données
- Facilite les tests et le changement de base de données

### 4.2 Service Layer Pattern
- Logique métier dans les services
- Controllers minces, services épais

### 4.3 Event-Driven Architecture
- Communication asynchrone entre services
- Découplage des services

### 4.4 Circuit Breaker Pattern
- Protection contre les pannes en cascade
- Fallback pour les services externes

### 4.5 Retry Pattern
- Retry avec backoff exponentiel
- Pour les appels API externes

---

## 5. Sécurité

### 5.1 Authentification et Autorisation
- JWT avec expiration courte (15 min)
- Refresh tokens avec expiration longue (7 jours)
- RBAC pour les rôles utilisateur

### 5.2 Protection des Données
- Chiffrement en transit (TLS 1.3)
- Chiffrement au repos (AES-256)
- Hashage des mots de passe (bcrypt/Argon2)

### 5.3 Sécurité des APIs
- Rate limiting par utilisateur/IP
- Validation et sanitization des entrées
- Protection CSRF et XSS

---

## 6. Scalabilité

### 6.1 Scalabilité Horizontale
- Services stateless
- Load balancing
- Base de données avec réplication

### 6.2 Optimisation
- Cache Redis pour les données fréquentes
- CDN pour les assets statiques
- Compression des réponses API

---

## 7. Monitoring et Observabilité

### 7.1 Logging
- Structured logging (JSON)
- Centralisé (ELK Stack, Loki)
- Niveaux: DEBUG, INFO, WARN, ERROR

### 7.2 Métriques
- Temps de réponse
- Taux d'erreur
- Utilisation des ressources
- Utilisation des modèles IA

### 7.3 Tracing
- Distributed tracing (Jaeger, Zipkin)
- Correlation IDs pour les requêtes

### 7.4 Alerting
- Alertes pour erreurs critiques
- Alertes pour dépassement de seuils
- Alertes pour problèmes de sécurité

---

## 8. Déploiement

### 8.1 Infrastructure
- **Containers**: Docker
- **Orchestration**: Kubernetes ou Docker Compose (dev)
- **CI/CD**: GitHub Actions, GitLab CI, ou Jenkins

### 8.2 Environnements
- **Development**: Local avec Docker Compose
- **Staging**: Environnement de test
- **Production**: Environnement de production avec haute disponibilité

---

## 9. Intégration

### 9.1 SDK JavaScript/TypeScript

```typescript
import { SereinClient } from '@serein/sdk';

const client = new SereinClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.serein.com'
});

// Conversation
const conversation = await client.conversations.create();
const response = await client.conversations.sendMessage(conversation.id, {
  message: 'Bonjour',
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

**Note**: Cette architecture de base est commune aux deux versions. Pour les détails spécifiques à chaque version, voir :
- [Architecture Open Source](../architecture/system-architecture.md) - Version open source
- [Architecture Standard](../../../serein-standard/docs/architecture/system-architecture.md) - Version standard
