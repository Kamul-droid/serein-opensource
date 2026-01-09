# Configuration SSH pour GitHub

## Guide de Configuration

### 1. Générer une nouvelle clé SSH

```powershell
# Générer une clé SSH ED25519 (recommandée)
ssh-keygen -t ed25519 -C "Kamul@goodiscovery.de" -f "$env:USERPROFILE\.ssh\id_ed25519_github"

# Ou si vous préférez RSA (moins sécurisé mais plus compatible)
ssh-keygen -t rsa -b 4096 -C "Kamul@goodiscovery.de" -f "$env:USERPROFILE\.ssh\id_rsa_github"
```

**Note**: Appuyez sur Entrée pour accepter l'emplacement par défaut, ou entrez un mot de passe pour sécuriser votre clé.

### 2. Démarrer l'agent SSH

```powershell
# Démarrer l'agent SSH
Start-Service ssh-agent

# Ajouter la clé à l'agent
ssh-add "$env:USERPROFILE\.ssh\id_ed25519_github"
```

### 3. Copier la clé publique

```powershell
# Afficher la clé publique
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_github.pub" | Set-Clipboard

# Ou simplement afficher
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_github.pub"
```

### 4. Ajouter la clé à GitHub

1. Allez sur GitHub.com
2. Cliquez sur votre profil (coin supérieur droit) → **Settings**
3. Dans le menu de gauche, cliquez sur **SSH and GPG keys**
4. Cliquez sur **New SSH key**
5. Donnez un titre (ex: "Windows PC - Serein")
6. Collez la clé publique dans le champ "Key"
7. Cliquez sur **Add SSH key**

### 5. Configurer SSH pour GitHub

Créer/modifier le fichier `~/.ssh/config`:

```powershell
# Créer le fichier config s'il n'existe pas
if (-not (Test-Path "$env:USERPROFILE\.ssh\config")) {
    New-Item -Path "$env:USERPROFILE\.ssh\config" -ItemType File
}

# Ajouter la configuration GitHub
@"
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes
"@ | Add-Content "$env:USERPROFILE\.ssh\config"
```

### 6. Tester la connexion SSH

```powershell
# Accepter la clé de GitHub (première fois)
ssh -T git@github.com
# Répondez "yes" à la question

# Tester à nouveau
ssh -T git@github.com
# Devrait afficher: "Hi Kamul-droid! You've successfully authenticated..."
```

### 7. Changer le remote de HTTPS à SSH

```powershell
cd "d:\ShareFolder\ShareFolder (SHURIKEN)\Serein\serein-opensource"

# Supprimer l'ancien remote HTTPS
git remote remove origin

# Ajouter le remote SSH
git remote add origin git@github.com:Kamul-droid/serein-opensource.git

# Vérifier
git remote -v
```

### 8. Pousser vers GitHub

```powershell
# Vérifier que vous êtes sur main
git branch

# Si nécessaire, renommer la branche
git branch -M main

# Pousser
git push -u origin main
```

## Dépannage

### Erreur: "Permission denied (publickey)"

**Causes possibles**:
- La clé n'est pas ajoutée à l'agent SSH
- La clé n'est pas ajoutée à GitHub
- Le fichier `config` SSH n'est pas correct

**Solutions**:
```powershell
# Vérifier que la clé est dans l'agent
ssh-add -l

# Si vide, ajouter la clé
ssh-add "$env:USERPROFILE\.ssh\id_ed25519_github"

# Vérifier la configuration SSH
Get-Content "$env:USERPROFILE\.ssh\config"
```

### Erreur: "Host key verification failed"

**Solution**: Accepter la clé de GitHub:
```powershell
ssh -T git@github.com
# Répondez "yes"
```

### Erreur: "Could not open a connection to your authentication agent"

**Solution**: Démarrer l'agent SSH:
```powershell
Start-Service ssh-agent
ssh-add "$env:USERPROFILE\.ssh\id_ed25519_github"
```

## Vérification Finale

```powershell
# 1. Vérifier la clé dans l'agent
ssh-add -l

# 2. Tester la connexion
ssh -T git@github.com

# 3. Vérifier le remote
git remote -v

# 4. Tester un push
git push -u origin main
```

---

**Note**: Si vous utilisez plusieurs comptes GitHub, vous pouvez créer plusieurs clés SSH et les configurer dans `~/.ssh/config` avec des hosts différents (ex: `github-personal`, `github-work`).
