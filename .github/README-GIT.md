# Guide Git - Serein Open Source

## 🚀 Démarrage Rapide

### Initialisation (Déjà fait)

```bash
cd serein-opensource
git init
git add .
git commit -m "chore: initial commit"
```

### Configuration (Optionnel)

```bash
# Configurer votre nom et email (si pas déjà fait globalement)
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"
```

## 📋 Règles de Versioning

### Commits

Format: `type(scope): subject`

**Types**:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance

**Exemples**:
```bash
git commit -m "feat(auth): add user registration"
git commit -m "fix(conversation): resolve WebSocket reconnection"
git commit -m "docs: update API documentation"
```

### Branches

- `main` - Production
- `develop` - Développement
- `feature/001-description` - Nouvelles fonctionnalités
- `fix/042-description` - Corrections
- `release/v1.0.0` - Préparation release
- `hotfix/1.0.1-description` - Corrections urgentes

## 📚 Documentation Complète

- **[GIT-WORKFLOW.md](.github/GIT-WORKFLOW.md)** - Workflow complet et règles détaillées
- **[BRANCHING-STRATEGY.md](.github/BRANCHING-STRATEGY.md)** - Stratégie de branches
- **[commit-convention.md](.github/commit-convention.md)** - Convention de commits

## ✅ Premier Commit

Le premier commit a été créé avec le message :
```
chore: initial commit - Phase 0.1 infrastructure setup
```

---

**Note**: Voir les fichiers dans `.github/` pour la documentation complète.
