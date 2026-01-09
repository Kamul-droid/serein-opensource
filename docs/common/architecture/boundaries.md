# Boundaries (Limites) du Système - Serein

## Version: 1.0
## Date: 09.01.2026

---

## 1. Vue d'Ensemble

Ce document définit les limites (boundaries) du système Serein, c'est-à-dire ce que le système fait, ce qu'il ne fait pas, et comment il interagit avec les systèmes externes.

**Note**: Ces boundaries sont communes à toutes les versions de Serein. Les implémentations peuvent différer selon la version (services cloud vs open source).

---

## 2. Boundaries Fonctionnelles

### 2.1 Ce que le Système FAIT ✅

#### Gestion des Utilisateurs
- ✅ Authentification et autorisation
- ✅ Gestion des profils utilisateur
- ✅ Stockage des préférences utilisateur
- ✅ Gestion des sessions

#### Conversation IA
- ✅ Conversations textuelles avec agent IA
- ✅ Conversations vocales avec agent IA
- ✅ Gestion du contexte de conversation
- ✅ Historique des conversations
- ✅ Recherche de contenu basée sur les croyances

#### Domaine du Bien-être
- ✅ Discussions sur la philosophie
- ✅ Discussions sur la spiritualité
- ✅ Discussions sur le développement personnel
- ✅ Discussions sur la méditation
- ✅ Discussions sur le bien-être mental et émotionnel
- ✅ Recommandations de livres et ressources

#### Optimisation
- ✅ Sélection intelligente de modèles IA (performance/complexité)
- ✅ Cache des réponses fréquentes
- ✅ Tracking de l'utilisation des ressources

### 2.2 Ce que le Système NE FAIT PAS ❌

#### Diagnostic et Conseils Médicaux
- ❌ Diagnostic médical
- ❌ Conseils médicaux
- ❌ Prescription de médicaments
- ❌ Traitement de conditions médicales
- ❌ Remplacement de professionnels de santé

#### Autres Domaines Hors Scope
- ❌ Conseils légaux (redirection vers avocats)
- ❌ Conseils financiers (redirection vers conseillers)
- ❌ Conseils techniques spécialisés (redirection vers experts)

#### Gestion de Données Médicales
- ❌ Stockage de données médicales sensibles
- ❌ Gestion de dossiers médicaux
- ❌ Partage de données médicales

---

## 3. Boundaries Techniques

### 3.1 Boundaries Internes

#### Frontend ↔ Backend
- **Communication**: Uniquement via API Gateway
- **Protocole**: HTTPS pour REST, WebSocket pour temps réel
- **Authentification**: JWT tokens requis (sauf endpoints publics)
- **Pas d'accès direct**: Frontend n'accède jamais directement aux bases de données

#### Services ↔ Services
- **Communication**: APIs REST ou message queue
- **Pas de partage de DB**: Chaque service a sa propre base de données
- **Découplage**: Services indépendants et déployables séparément
- **Contracts**: APIs définies via OpenAPI/Swagger

#### Services ↔ External Services
- **Abstraction**: Adapters/clients pour services externes
- **Retry Logic**: Retry avec backoff exponentiel
- **Circuit Breaker**: Protection contre pannes en cascade
- **Timeout**: Timeouts configurés pour tous les appels externes
- **Fallback**: Mécanismes de fallback quand possible

### 3.2 Boundaries Externes

#### Services IA
**Version Standard**: OpenAI, Anthropic (cloud)
**Version Open Source**: Ollama (local)

- **Responsabilité**: Fournir des réponses IA
- **Limite**: Le système ne contrôle pas la qualité intrinsèque des modèles
- **Gestion**: Le système gère la sélection de modèle et le contexte

#### Services Vocaux
**Version Standard**: ElevenLabs, Azure Speech (cloud)
**Version Open Source**: Coqui TTS, Whisper (local)

- **Responsabilité**: Synthèse et reconnaissance vocale
- **Limite**: Le système ne contrôle pas la qualité de la voix
- **Gestion**: Le système gère les préférences utilisateur et le formatage

#### Bases de Données Externes
- **PostgreSQL**: Stockage principal
- **Redis**: Cache et sessions
- **Vector DB**: Recherche sémantique
  - **Version Standard**: Pinecone (cloud)
  - **Version Open Source**: Weaviate/Qdrant (self-hosted)

---

## 4. Boundaries de Domaine

### 4.1 Domaine du Bien-être (IN SCOPE)

#### Philosophie
- ✅ Philosophie occidentale et orientale
- ✅ Éthique et morale
- ✅ Questions existentielles
- ✅ Réflexions sur la vie

#### Spiritualité
- ✅ Traditions spirituelles (Bouddhisme, Hindouisme, etc.)
- ✅ Méditation et pratiques contemplatives
- ✅ Développement spirituel
- ✅ Questions métaphysiques

#### Développement Personnel
- ✅ Croissance personnelle
- ✅ Gestion des émotions
- ✅ Habitudes saines
- ✅ Mindfulness

#### Bien-être Mental
- ✅ Bien-être émotionnel
- ✅ Gestion du stress
- ✅ Techniques de relaxation
- ✅ Équilibre vie/travail

### 4.2 Domaines Hors Scope (avec Redirection)

#### Questions Médicales
- **Détection**: Le système détecte les questions médicales
- **Réponse**: Disclaimer + redirection vers professionnels
- **Exemple**: "Je ne suis pas un professionnel de santé. Pour des questions médicales, veuillez consulter un médecin."

#### Questions Légales
- **Détection**: Le système détecte les questions légales
- **Réponse**: Redirection vers avocats
- **Exemple**: "Pour des questions légales, veuillez consulter un avocat qualifié."

#### Questions Financières
- **Détection**: Le système détecte les questions financières complexes
- **Réponse**: Redirection vers conseillers financiers
- **Exemple**: "Pour des conseils financiers, veuillez consulter un conseiller financier certifié."

---

## 5. Boundaries de Sécurité

### 5.1 Données Utilisateur

#### Données Stockées
- ✅ Profil utilisateur (nom, email, préférences)
- ✅ Croyances et centres d'intérêt
- ✅ Historique de conversation
- ✅ Préférences de voix et interface

#### Données NON Stockées
- ❌ Mots de passe en clair (seulement hashés)
- ❌ Données médicales
- ❌ Informations financières sensibles
- ❌ Données de paiement (gérées par processeur tiers)

### 5.2 Accès et Autorisation

#### Accès Autorisé
- ✅ Utilisateur accède à ses propres données
- ✅ Administrateurs accèdent aux données système (logs, métriques)
- ✅ Services internes communiquent via APIs authentifiées

#### Accès NON Autorisé
- ❌ Accès direct aux bases de données depuis l'extérieur
- ❌ Partage de données entre utilisateurs
- ❌ Accès aux données sans authentification

---

## 6. Boundaries de Performance

### 6.1 Garanties

#### Temps de Réponse
- ✅ Questions simples: < 3 secondes
- ✅ Questions complexes: < 10 secondes
- ✅ Interface: < 2 secondes de chargement

#### Scalabilité
- ✅ Support de 1000+ utilisateurs simultanés
- ✅ Scalabilité horizontale
- ✅ Load balancing automatique

### 6.2 Limitations

#### Limitations Techniques
- ⚠️ Dépend de la disponibilité des services externes (IA, TTS)
- ⚠️ Performance dépend de la latence réseau (version standard) ou du hardware local (version open source)
- ⚠️ Utilisation des ressources peut limiter l'usage à grande échelle (version open source)

#### Limitations Fonctionnelles
- ⚠️ Qualité des réponses dépend des modèles IA utilisés
- ⚠️ Disponibilité dépend des services (cloud ou infrastructure locale)

---

## 7. Boundaries de Coût/Ressources

### 7.1 Optimisation

#### Stratégies Implémentées
- ✅ Utilisation de modèles économiques/performants en priorité
- ✅ Cache des réponses fréquentes
- ✅ Montée en charge intelligente (modèles avancés si nécessaire)
- ✅ Tracking précis de l'utilisation

### 7.2 Limitations

#### Coûts/Ressources Externes
**Version Standard**:
- ⚠️ Coûts des services IA (OpenAI, Anthropic)
- ⚠️ Coûts des services vocaux (ElevenLabs, Azure)
- ⚠️ Coûts de l'infrastructure cloud
- ⚠️ Coûts de la base de données vectorielle

**Version Open Source**:
- ⚠️ Coûts de l'infrastructure (serveurs)
- ⚠️ Utilisation des ressources (CPU, GPU, mémoire)
- ⚠️ Maintenance de l'infrastructure

#### Contrôle
- ✅ Le système peut limiter l'usage par utilisateur
- ✅ Le système peut mettre en cache pour réduire les appels
- ❌ Le système ne contrôle pas les prix des services externes (version standard)
- ❌ Le système ne contrôle pas les limites du hardware (version open source)

---

## 8. Boundaries d'Intégration

### 8.1 Intégrations Supportées

#### Frontend
- ✅ Intégration JavaScript/TypeScript vanilla
- ✅ Intégration React
- ✅ Intégration via SDK
- ✅ Intégration via widget

#### Backend
- ✅ APIs REST
- ✅ WebSocket pour temps réel
- ✅ Webhooks (futur)

### 8.2 Limitations d'Intégration

#### Non Supporté Actuellement
- ❌ Intégration native mobile (SDK séparé requis)
- ❌ Intégration avec systèmes legacy spécifiques
- ❌ Intégration avec ERP/CRM (futur)

---

## 9. Boundaries Évolutifs

### 9.1 Extensions Futures Possibles

#### Fonctionnalités Potentielles
- 🔮 Support multi-langues
- 🔮 Intégration calendrier pour rappels
- 🔮 Analytics avancés pour utilisateurs
- 🔮 API publique pour développeurs tiers
- 🔮 Fine-tuning de modèles pour le domaine bien-être

### 9.2 Limitations Évolutives

#### Contraintes
- ⚠️ Évolution dépend des capacités des modèles IA
- ⚠️ Évolution dépend des budgets et ressources
- ⚠️ Évolution doit respecter les boundaries de domaine (pas de médical)

---

## 10. Règles de Décision

### 10.1 Quand Ajouter une Fonctionnalité

**AJOUTER si**:
- ✅ S'inscrit dans le domaine du bien-être
- ✅ Améliore l'expérience utilisateur
- ✅ Respecte les boundaries de sécurité
- ✅ Est techniquement faisable
- ✅ Respecte le budget/ressources

**NE PAS AJOUTER si**:
- ❌ Sort du domaine du bien-être (sans redirection)
- ❌ Implique des données médicales sensibles
- ❌ Compromet la sécurité
- ❌ Coûts/ressources prohibitifs
- ❌ Complexité technique excessive

### 10.2 Quand Rediriger

**REDIRIGER vers professionnel si**:
- ⚠️ Question médicale détectée
- ⚠️ Question légale complexe
- ⚠️ Question financière nécessitant expertise
- ⚠️ Question hors domaine du bien-être

---

## 11. Exemples de Boundaries en Action

### 11.1 Exemple 1: Question Bien-être ✅

**Question**: "Comment puis-je améliorer ma pratique de méditation?"

**Réponse du Système**:
- ✅ Traite la question (dans le domaine)
- ✅ Fournit des conseils sur la méditation
- ✅ Peut recommander des livres
- ✅ Enregistre dans l'historique

### 11.2 Exemple 2: Question Médicale ⚠️

**Question**: "J'ai mal à la tête depuis 3 jours, que dois-je faire?"

**Réponse du Système**:
- ⚠️ Détecte la question médicale
- ⚠️ Répond avec disclaimer: "Je ne suis pas un professionnel de santé..."
- ⚠️ Redirige vers un médecin
- ⚠️ N'enregistre PAS de diagnostic ou conseil médical

### 11.3 Exemple 3: Question Hors Domaine ❌

**Question**: "Comment créer une entreprise?"

**Réponse du Système**:
- ❌ Détecte que c'est hors domaine bien-être
- ❌ Répond poliment: "Je me concentre sur le bien-être..."
- ❌ Peut rediriger vers des ressources appropriées
- ❌ N'enregistre pas comme conversation bien-être

---

## 12. Maintenance des Boundaries

### 12.1 Révision Périodique

- **Fréquence**: Trimestrielle
- **Participants**: Équipe technique, product owner
- **Objectif**: Vérifier que les boundaries sont toujours appropriées

### 12.2 Documentation

- **Mise à jour**: Lors de changements majeurs
- **Versioning**: Suivi des versions de ce document
- **Communication**: Partage avec toute l'équipe

---

## 13. Conclusion

Les boundaries définies dans ce document garantissent que:
- ✅ Le système reste focalisé sur son domaine (bien-être)
- ✅ La sécurité et la confidentialité sont respectées
- ✅ Les utilisateurs reçoivent des réponses appropriées
- ✅ Le système peut évoluer de manière contrôlée
- ✅ Les coûts/ressources sont maîtrisés

Ces boundaries doivent être respectées lors du développement de nouvelles fonctionnalités, quelle que soit la version (standard ou open source).

---

**Note**: Ces boundaries sont communes aux deux versions. Les implémentations techniques peuvent différer, mais les limites fonctionnelles et de domaine restent identiques.
