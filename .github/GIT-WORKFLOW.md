# Git Workflow et Règles de Versioning - Serein Open Source

## Version: 1.0
## Date: 09.01.2026

---

## 1. Stratégie de Branches

### 1.1 Branches Principales

#### `main`
- **Rôle**: Branche de production, toujours stable
- **Protection**: Requiert review et tests passants
- **Merge**: Uniquement depuis `develop` via Pull Request
- **Tags**: Tags de version (semantic versioning)

#### `develop`
- **Rôle**: Branche de développement, intégration des features
- **Protection**: Requiert tests passants
- **Merge**: Uniquement depuis les branches de feature
- **Déploiement**: Environnement de staging

### 1.2 Branches de Feature

#### Format: `feature/<issue-number>-<short-description>`
- **Exemple**: `feature/001-auth-service-setup`
- **Rôle**: Développement d'une nouvelle fonctionnalité
- **Source**: `develop`
- **Merge**: Vers `develop` via Pull Request
- **Durée**: Temporaire, supprimée après merge

#### Règles:
- Une feature = une branche
- Nom descriptif et court
- Préfixe avec numéro d'issue si disponible

### 1.3 Branches de Fix

#### Format: `fix/<issue-number>-<short-description>`
- **Exemple**: `fix/042-auth-token-expiration`
- **Rôle**: Correction de bugs
- **Source**: `develop` ou `main` (selon criticité)
- **Merge**: Vers `develop` ou `main` selon criticité

### 1.4 Branches de Release

#### Format: `release/v<version>`
- **Exemple**: `release/v1.0.0`
- **Rôle**: Préparation d'une nouvelle version
- **Source**: `develop`
- **Merge**: Vers `main` et `develop`
- **Actions**: 
  - Mise à jour CHANGELOG.md
  - Mise à jour version dans package.json
  - Création tag de version

### 1.5 Branches Hotfix

#### Format: `hotfix/<version>-<short-description>`
- **Exemple**: `hotfix/1.0.1-security-patch`
- **Rôle**: Correction critique en production
- **Source**: `main`
- **Merge**: Vers `main` et `develop`
- **Urgence**: Critique, bypass possible des reviews

---

## 2. Conventional Commits

### 2.1 Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 Types de Commits

#### `feat`: Nouvelle fonctionnalité
```
feat(auth): add JWT token refresh mechanism
```

#### `fix`: Correction de bug
```
fix(user): resolve profile update validation error
```

#### `docs`: Documentation uniquement
```
docs: update API documentation
```

#### `style`: Formatage, point-virgule manquant, etc.
```
style: format code with prettier
```

#### `refactor`: Refactoring du code
```
refactor(ai): simplify model selection logic
```

#### `perf`: Amélioration de performance
```
perf(conversation): optimize database queries
```

#### `test`: Ajout ou modification de tests
```
test(auth): add integration tests for login
```

#### `chore`: Tâches de maintenance
```
chore: update dependencies
```

#### `build`: Changements du système de build
```
build: update docker-compose configuration
```

#### `ci`: Changements CI/CD
```
ci: add GitHub Actions workflow
```

### 2.3 Scope (Optionnel)

Le scope indique la partie du code affectée :
- `auth` - Service d'authentification
- `user` - Service utilisateur
- `conversation` - Service de conversation
- `ai` - Service IA
- `content` - Service de contenu
- `voice` - Service vocal
- `frontend` - Application frontend
- `shared` - Code partagé
- `infrastructure` - Infrastructure
- `docs` - Documentation

### 2.4 Subject

- **Format**: Impératif, minuscule, pas de point final
- **Longueur**: Maximum 72 caractères
- **Exemples**:
  - ✅ `add user authentication`
  - ✅ `fix token expiration bug`
  - ❌ `Added user authentication` (pas d'impératif)
  - ❌ `fixes bug` (trop vague)

### 2.5 Body (Optionnel)

- **Quand**: Pour expliquer le "quoi" et "pourquoi"
- **Format**: Libre, mais clair
- **Séparation**: Ligne vide après le subject

### 2.6 Footer (Optionnel)

- **Breaking changes**: `BREAKING CHANGE: <description>`
- **Issues**: `Closes #123`, `Fixes #456`

### 2.7 Exemples Complets

#### Feature
```
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Token expires after 1 hour for security.

Closes #42
```

#### Fix
```
fix(conversation): resolve WebSocket reconnection issue

WebSocket was not reconnecting after network interruption.
Added exponential backoff retry mechanism.

Fixes #78
```

#### Breaking Change
```
feat(api): refactor authentication endpoints

BREAKING CHANGE: /auth/login now returns tokens in body instead of headers.
Migration guide available in docs/migration/v1.0.0.md

Closes #100
```

---

## 3. Semantic Versioning

### 3.1 Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Changements incompatibles (breaking changes)
- **MINOR**: Nouvelles fonctionnalités rétro-compatibles
- **PATCH**: Corrections de bugs rétro-compatibles

### 3.2 Exemples

- `1.0.0` - Version initiale
- `1.0.1` - Correction de bug
- `1.1.0` - Nouvelle fonctionnalité
- `2.0.0` - Breaking change

### 3.3 Pré-versions

- `1.0.0-alpha.1` - Version alpha
- `1.0.0-beta.1` - Version beta
- `1.0.0-rc.1` - Release candidate

---

## 4. Pull Requests

### 4.1 Format du Titre

Utiliser le même format que les commits :
```
feat(auth): add password reset functionality
```

### 4.2 Template de PR

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Feature (nouvelle fonctionnalité)
- [ ] Fix (correction de bug)
- [ ] Documentation
- [ ] Refactoring
- [ ] Performance

## Checklist
- [ ] Code testé localement
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de breaking changes (ou documentés)
- [ ] CHANGELOG.md mis à jour

## Issues liées
Closes #42

## Screenshots (si applicable)
```

### 4.3 Review Requirements

- **Minimum**: 1 approbation
- **Tests**: Tous les tests doivent passer
- **Lint**: Pas d'erreurs de linting
- **Coverage**: Maintenir 80% minimum

---

## 5. Tags de Version

### 5.1 Format

```
v<MAJOR>.<MINOR>.<PATCH>
```

### 5.2 Création

```bash
# Créer un tag annoté
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push le tag
git push origin v1.0.0
```

### 5.3 Tags Spéciaux

- `latest` - Dernière version stable
- `next` - Prochaine version en développement

---

## 6. Workflow Complet

### 6.1 Développement d'une Feature

```bash
# 1. Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/001-auth-service-setup

# 2. Développer et commiter
git add .
git commit -m "feat(auth): add user registration endpoint"

# 3. Push et créer PR
git push origin feature/001-auth-service-setup
# Créer PR sur GitHub vers develop

# 4. Après merge, supprimer la branche locale
git checkout develop
git pull origin develop
git branch -d feature/001-auth-service-setup
```

### 6.2 Release

```bash
# 1. Créer branche release
git checkout develop
git checkout -b release/v1.0.0

# 2. Mettre à jour version et CHANGELOG
# (modifications manuelles)

# 3. Commiter
git commit -m "chore: bump version to 1.0.0"

# 4. Merge vers main
git checkout main
git merge release/v1.0.0

# 5. Créer tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# 6. Merge vers develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# 7. Supprimer branche release
git branch -d release/v1.0.0
```

### 6.3 Hotfix

```bash
# 1. Créer branche depuis main
git checkout main
git checkout -b hotfix/1.0.1-security-patch

# 2. Corriger et commiter
git commit -m "fix(security): patch authentication vulnerability"

# 3. Merge vers main et develop
git checkout main
git merge hotfix/1.0.1-security-patch
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin main --tags

git checkout develop
git merge hotfix/1.0.1-security-patch
git push origin develop
```

---

## 7. Règles de Commit

### 7.1 Avant de Commiter

- ✅ Code testé localement
- ✅ Tests passants
- ✅ Linting OK
- ✅ Pas de fichiers temporaires
- ✅ Pas de secrets dans le code

### 7.2 Fréquence

- **Petits commits fréquents** plutôt que gros commits rares
- **Un commit = une modification logique**
- **Commits atomiques** (facilite le rollback)

### 7.3 Messages

- **Clairs et descriptifs**
- **En français** (pour ce projet)
- **Format conventional commits**
- **Référencer les issues** si applicable

---

## 8. Protection des Branches

### 8.1 Branches Protégées

- `main` - Protection complète
- `develop` - Protection partielle

### 8.2 Règles de Protection

#### Pour `main`:
- ✅ Requiert Pull Request
- ✅ Requiert review (1 minimum)
- ✅ Requiert tests passants
- ✅ Requiert status checks
- ✅ Pas de force push
- ✅ Pas de suppression

#### Pour `develop`:
- ✅ Requiert tests passants
- ✅ Pas de force push
- ⚠️ Reviews recommandées mais pas obligatoires

---

## 9. CHANGELOG.md

### 9.1 Format

Suivre [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) :

```markdown
## [1.0.0] - 2026-01-09

### Added
- Feature 1
- Feature 2

### Changed
- Modification 1

### Fixed
- Bug fix 1

### Removed
- Deprecated feature
```

### 9.2 Mise à Jour

- **À chaque PR**: Mettre à jour CHANGELOG.md
- **Section**: Selon le type de changement
- **Format**: Conventional commits

---

## 10. Exemples Pratiques

### 10.1 Feature Complète

```bash
# Créer branche
git checkout -b feature/001-auth-service

# Développer
git add src/auth/
git commit -m "feat(auth): implement user registration"

git add tests/auth/
git commit -m "test(auth): add registration tests"

git add docs/
git commit -m "docs(auth): add API documentation"

# Push
git push origin feature/001-auth-service

# Créer PR avec titre: "feat(auth): implement user registration"
```

### 10.2 Fix Urgent

```bash
# Créer branche
git checkout -b fix/042-token-expiration

# Corriger
git add src/auth/
git commit -m "fix(auth): resolve token expiration bug

Token was expiring too early due to timezone issue.
Fixed by using UTC consistently.

Fixes #42"

# Push et merge rapide
git push origin fix/042-token-expiration
```

---

## 11. Outils Recommandés

### 11.1 Git Hooks

Utiliser Husky pour :
- Pre-commit: Linting et formatage
- Commit-msg: Validation format conventional commits
- Pre-push: Tests

### 11.2 Commitizen

Pour faciliter les commits conventional :
```bash
npm install -g commitizen
```

### 11.3 Semantic Release

Pour automatiser les releases :
```bash
npm install semantic-release
```

---

## 12. Checklist Avant Commit

- [ ] Code testé localement
- [ ] Tests passants (`npm test`)
- [ ] Linting OK (`npm run lint`)
- [ ] Formatage OK (`npm run format:check`)
- [ ] Pas de secrets dans le code
- [ ] Message de commit conforme
- [ ] CHANGELOG.md mis à jour (si applicable)
- [ ] Documentation mise à jour (si applicable)

---

## 13. Résolution de Conflits

### 13.1 Stratégie

1. **Toujours rebase** sur la branche cible avant merge
2. **Résoudre les conflits** localement
3. **Tester** après résolution
4. **Commiter** la résolution

### 13.2 Commandes

```bash
# Rebase sur develop
git checkout feature/my-feature
git fetch origin
git rebase origin/develop

# Résoudre conflits si nécessaire
# Puis continuer
git add .
git rebase --continue

# Push (force avec lease pour sécurité)
git push origin feature/my-feature --force-with-lease
```

---

## 14. Règles Spécifiques au Projet

### 14.1 Services

Chaque service doit avoir ses propres commits :
```
feat(auth): add user registration
feat(user): add profile management
```

### 14.2 Documentation

Documentation séparée du code :
```
docs: update architecture documentation
docs(api): add authentication endpoints
```

### 14.3 Infrastructure

Changements infrastructure :
```
build: update docker-compose configuration
ci: add GitHub Actions workflow
```

---

## 15. Exceptions

### 15.1 Commits de WIP

Pour work-in-progress :
```
wip: work in progress on auth service
```

### 15.2 Commits de Merge

Format automatique :
```
Merge branch 'feature/xxx' into develop
```

### 15.3 Commits de Revert

```
revert: revert "feat(auth): add feature X"

This reverts commit abc123.
Reason: Caused breaking change.
```

---

## 16. Validation Automatique

### 16.1 Pre-commit Hook

```bash
# .husky/pre-commit
npm run lint
npm run format:check
npm run test:unit
```

### 16.2 Commit-msg Hook

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

---

## 17. Résumé des Règles

### Branches
- `main` - Production
- `develop` - Développement
- `feature/*` - Nouvelles fonctionnalités
- `fix/*` - Corrections
- `release/*` - Préparation release
- `hotfix/*` - Corrections urgentes

### Commits
- Format: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci
- Impératif, clair, descriptif

### Versioning
- Semantic Versioning: `MAJOR.MINOR.PATCH`
- Tags: `v1.0.0`
- CHANGELOG.md mis à jour

---

**Note**: Ces règles doivent être suivies par toute l'équipe pour maintenir un historique Git propre et traçable.
