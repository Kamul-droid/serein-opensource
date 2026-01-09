# Stratégie de Branches - Serein Open Source

## Vue d'Ensemble

Cette stratégie suit le **Git Flow** adapté pour un projet open source.

## Branches Principales

### `main`
- **Rôle**: Code de production, toujours stable et déployable
- **Protection**: 
  - Requiert Pull Request
  - Requiert review (1 minimum)
  - Requiert tous les tests passants
  - Pas de push direct
- **Tags**: Tags de version (v1.0.0, v1.1.0, etc.)

### `develop`
- **Rôle**: Branche d'intégration pour le développement
- **Protection**:
  - Requiert tests passants
  - Pas de force push
- **Source**: Branches de feature
- **Destination**: `main` via release

## Branches de Support

### `feature/<issue>-<description>`
- **Exemple**: `feature/001-auth-service-setup`
- **Source**: `develop`
- **Destination**: `develop`
- **Durée**: Temporaire, supprimée après merge
- **Convention**: 
  - Préfixe avec numéro d'issue
  - Description courte et claire

### `fix/<issue>-<description>`
- **Exemple**: `fix/042-token-expiration`
- **Source**: `develop` ou `main` (selon criticité)
- **Destination**: `develop` ou `main`
- **Usage**: Corrections de bugs

### `release/v<version>`
- **Exemple**: `release/v1.0.0`
- **Source**: `develop`
- **Destination**: `main` et `develop`
- **Actions**:
  - Mise à jour CHANGELOG.md
  - Mise à jour version
  - Préparation release

### `hotfix/<version>-<description>`
- **Exemple**: `hotfix/1.0.1-security-patch`
- **Source**: `main`
- **Destination**: `main` et `develop`
- **Usage**: Corrections critiques en production

## Workflow Visuel

```
main        ●─────────────────●───────────────●
             \               /               /
              \             /               /
develop        ●───────────●───────────────●
                \         / \             /
                 \       /   \           /
feature/001       ●─────●     \         /
feature/002              ●─────●       /
fix/042                        ●───────●
```

## Règles de Nommage

### Feature
- Format: `feature/<issue-number>-<short-description>`
- Exemples:
  - `feature/001-auth-service`
  - `feature/015-voice-integration`

### Fix
- Format: `fix/<issue-number>-<short-description>`
- Exemples:
  - `fix/042-token-bug`
  - `fix/078-websocket-reconnect`

### Release
- Format: `release/v<MAJOR>.<MINOR>.<PATCH>`
- Exemples:
  - `release/v1.0.0`
  - `release/v1.1.0`

### Hotfix
- Format: `hotfix/<version>-<short-description>`
- Exemples:
  - `hotfix/1.0.1-security-patch`
  - `hotfix/1.0.2-memory-leak`

## Protection des Branches

### main
- ✅ Requiert PR
- ✅ Requiert review (1+)
- ✅ Requiert tests passants
- ✅ Pas de force push
- ✅ Pas de suppression

### develop
- ✅ Requiert tests passants
- ✅ Pas de force push
- ⚠️ Reviews recommandées

## Exemples de Workflow

### Développement Feature

```bash
# 1. Créer branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/001-auth-service

# 2. Développer
# ... code ...

# 3. Commiter
git commit -m "feat(auth): add user registration"

# 4. Push
git push origin feature/001-auth-service

# 5. Créer PR vers develop
# 6. Après merge, supprimer branche locale
git checkout develop
git branch -d feature/001-auth-service
```

### Release

```bash
# 1. Créer branche release
git checkout develop
git checkout -b release/v1.0.0

# 2. Mettre à jour version et CHANGELOG
# ... modifications ...

# 3. Merge vers main
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# 4. Merge vers develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# 5. Supprimer branche release
git branch -d release/v1.0.0
```

---

Voir [GIT-WORKFLOW.md](GIT-WORKFLOW.md) pour les détails complets.
