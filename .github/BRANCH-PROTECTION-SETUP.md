# Configuration de la Protection des Branches

## Vue d'Ensemble

Ce guide explique comment configurer la protection des branches sur GitHub pour empêcher les pushes directs sur `main` et `develop`.

## Méthode 1: Protection de Branche GitHub (Recommandée)

### Configuration via l'Interface GitHub

1. **Accéder aux paramètres du repository**:
   - Allez sur votre repository GitHub
   - Cliquez sur **Settings** (Paramètres)
   - Dans le menu de gauche, cliquez sur **Branches**

2. **Protéger la branche `main`**:
   - Cliquez sur **Add rule** (Ajouter une règle)
   - Dans **Branch name pattern**, entrez: `main`
   - Cochez les options suivantes:
     - ✅ **Require a pull request before merging**
       - ✅ Require approvals: `1` (minimum)
       - ✅ Dismiss stale pull request approvals when new commits are pushed
     - ✅ **Require status checks to pass before merging**
       - Sélectionnez: `lint`, `test`, `build`
       - ✅ Require branches to be up to date before merging
     - ✅ **Require conversation resolution before merging**
     - ✅ **Do not allow bypassing the above settings**
     - ✅ **Restrict who can push to matching branches**
       - Laissez vide (personne ne peut push directement)
     - ✅ **Do not allow force pushes**
     - ✅ **Do not allow deletions**

3. **Protéger la branche `develop`**:
   - Cliquez sur **Add rule** (Ajouter une règle)
   - Dans **Branch name pattern**, entrez: `develop`
   - Cochez les options suivantes:
     - ✅ **Require status checks to pass before merging**
       - Sélectionnez: `lint`, `test`, `build`
     - ✅ **Do not allow force pushes**
     - ⚠️ **Do not allow deletions** (optionnel mais recommandé)

### Configuration via GitHub CLI

Si vous préférez utiliser la ligne de commande:

```bash
# Installer GitHub CLI si nécessaire
# https://cli.github.com/

# Protéger main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","test","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

# Protéger develop
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","test","build"]}' \
  --field enforce_admins=false \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

### Configuration via Terraform (Infrastructure as Code)

Si vous utilisez Terraform pour gérer votre infrastructure:

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.serein_opensource.node_id
  
  pattern                         = "main"
  enforce_admins                  = true
  require_signed_commits          = false
  required_linear_history         = false
  require_conversation_resolution = true
  allow_force_pushes              = false
  allow_deletions                 = false

  required_status_checks {
    strict   = true
    contexts = ["lint", "test", "build"]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
  }

  restrictions {
    # Vide = personne ne peut push directement
  }
}

resource "github_branch_protection" "develop" {
  repository_id = github_repository.serein_opensource.node_id
  
  pattern                = "develop"
  enforce_admins         = false
  allow_force_pushes     = false
  allow_deletions        = false

  required_status_checks {
    strict   = true
    contexts = ["lint", "test", "build"]
  }
}
```

## Méthode 2: Workflow GitHub Actions (Avertissement)

Un workflow GitHub Actions a été créé dans `.github/workflows/branch-protection.yml` pour détecter et avertir des pushes directs.

**⚠️ Important**: Ce workflow ne peut **pas bloquer** un push après qu'il a été fait. Il sert uniquement d'avertissement et de vérification.

Ce workflow:
- ✅ Détecte les pushes directs sur `main` ou `develop`
- ✅ Affiche un avertissement dans les logs GitHub Actions
- ✅ Identifie les commits qui ne viennent pas de PRs

**Note**: Ce workflow est complémentaire. La protection de branche GitHub (Méthode 1) est **obligatoire** et doit être configurée en priorité pour vraiment bloquer les pushes directs.

## Vérification

### Tester la Protection

1. **Essayer un push direct** (devrait échouer):
```bash
git checkout main
echo "# Test" >> test.md
git add test.md
git commit -m "test: direct push attempt"
git push origin main
# ❌ Devrait échouer avec: "remote: error: GH006: Protected branch update failed"
```

2. **Vérifier via l'interface GitHub**:
   - Allez sur **Settings** → **Branches**
   - Vérifiez que les règles sont bien configurées
   - Vérifiez l'icône de protection à côté de `main` et `develop`

### Vérifier les Status Checks

Les status checks doivent être configurés dans `.github/workflows/ci.yml`:
- `lint`
- `test`
- `build`

Ces checks doivent passer avant qu'une PR puisse être mergée.

## Exceptions (Hotfixes)

Pour les hotfixes critiques, vous pouvez:

1. **Créer une branche hotfix** depuis `main`:
```bash
git checkout main
git checkout -b hotfix/1.0.1-critical-fix
# ... corrections ...
git push origin hotfix/1.0.1-critical-fix
```

2. **Créer une PR** vers `main` (même pour les hotfixes, une PR est recommandée)

3. **Si vraiment nécessaire** (urgence critique), un administrateur peut:
   - Temporairement désactiver la protection (non recommandé)
   - Utiliser "Allow specified actors to bypass required pull requests" dans les paramètres

## Troubleshooting

### Erreur: "Protected branch update failed"

**Cause**: Tentative de push direct sur une branche protégée.

**Solution**: Créer une branche et une Pull Request:
```bash
git checkout -b feature/my-changes
git push origin feature/my-changes
# Créer une PR sur GitHub
```

### Erreur: "Required status check is missing"

**Cause**: Les status checks ne sont pas configurés ou ne passent pas.

**Solution**:
1. Vérifier que `.github/workflows/ci.yml` est correct
2. Vérifier que les jobs `lint`, `test`, `build` sont bien définis
3. Attendre que tous les checks passent

### Les administrateurs peuvent-ils bypasser?

Par défaut, si `enforce_admins` est activé, même les administrateurs ne peuvent pas bypasser. Pour permettre aux admins de bypasser (non recommandé), désactivez `enforce_admins`.

## Résumé

| Branche | Push Direct | Force Push | Suppression | PR Requise | Review Requise |
|---------|-------------|-------------|-------------|------------|----------------|
| `main`  | ❌ Bloqué    | ❌ Bloqué    | ❌ Bloqué    | ✅ Oui      | ✅ 1 minimum   |
| `develop` | ⚠️ Possible* | ❌ Bloqué    | ⚠️ Possible* | ⚠️ Non      | ⚠️ Recommandé  |

\* Pour `develop`, les pushes directs sont possibles mais non recommandés. Il est préférable d'utiliser des PRs.

---

**Voir aussi**:
- [BRANCHING-STRATEGY.md](BRANCHING-STRATEGY.md) - Stratégie complète
- [GIT-WORKFLOW.md](GIT-WORKFLOW.md) - Workflow Git détaillé
