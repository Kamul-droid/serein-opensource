# Guide de Déploiement Self-Hosted - Serein Open Source

## Version: 1.0
## Date: 09.01.2026

---

## 1. Vue d'Ensemble

Ce guide vous permet de déployer Serein entièrement en self-hosted sur votre propre infrastructure.

---

## 2. Prérequis

### 2.1 Infrastructure

**Minimum**:
- CPU: 8 cores
- RAM: 32 GB
- Storage: 500 GB SSD
- GPU: Optionnel (recommandé pour LLM)

**Recommandé**:
- CPU: 16+ cores
- RAM: 64+ GB
- Storage: 1 TB+ SSD
- GPU: NVIDIA avec 16+ GB VRAM (pour LLM local)

### 2.2 Logiciels

- Docker 24.0+
- Docker Compose 2.0+
- Node.js 20 LTS+ (pour développement)
- Git

### 2.3 Optionnel

- Kubernetes (pour production)
- Nginx (pour reverse proxy)
- Certbot (pour SSL/TLS)

---

## 3. Installation

### 3.1 Cloner le Repository

```bash
git clone https://github.com/your-org/serein-opensource.git
cd serein-opensource
```

### 3.2 Configuration

```bash
# Copier le fichier d'environnement
cp env.example .env

# Éditer les variables d'environnement
nano .env
```

### 3.3 Démarrer les Services

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### 3.4 Initialiser Ollama (LLM)

```bash
# Télécharger un modèle (ex: Llama 2)
docker exec serein-ollama ollama pull llama2

# Ou Mistral (plus léger)
docker exec serein-ollama ollama pull mistral

# Vérifier les modèles disponibles
docker exec serein-ollama ollama list
```

### 3.5 Initialiser Weaviate

Weaviate démarre automatiquement. Vérifiez avec:

```bash
curl http://localhost:8080/v1/.well-known/ready
```

---

## 4. Configuration des Services

### 4.1 Ollama (LLM)

**Modèles disponibles**:
- `llama2` - 7B parameters (recommandé pour début)
- `mistral` - 7B parameters (rapide)
- `llama2:13b` - 13B parameters (meilleure qualité)
- `llama2:70b` - 70B parameters (meilleure qualité, nécessite GPU)

**Télécharger un modèle**:
```bash
docker exec serein-ollama ollama pull llama2
```

**Utiliser un modèle spécifique**:
Modifier `OLLAMA_DEFAULT_MODEL` dans `.env`

### 4.2 Coqui TTS

**Voix disponibles**:
- `tts_models/fr/css10/vits` - Français
- `tts_models/en/ljspeech/tacotron2-DDC` - Anglais

**Configuration**:
Modifier `COQUI_TTS_DEFAULT_VOICE` dans `.env`

### 4.3 Whisper

**Modèles disponibles**:
- `tiny` - Plus rapide, moins précis
- `base` - Équilibre (recommandé)
- `small` - Meilleure qualité
- `medium` - Très bonne qualité
- `large` - Meilleure qualité (nécessite plus de RAM)

**Configuration**:
Modifier `WHISPER_MODEL` dans `.env`

### 4.4 Weaviate

**Schéma**:
Le schéma est créé automatiquement au premier démarrage.

**Indexer des données**:
Voir la documentation de l'API Content Service.

---

## 5. Monitoring

### 5.1 Accès aux Interfaces

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

### 5.2 Configuration Grafana

1. Se connecter à Grafana
2. Ajouter Prometheus comme datasource (http://prometheus:9090)
3. Importer les dashboards depuis `infrastructure/monitoring/grafana/dashboards`

### 5.3 Alertes

Configurer les alertes dans Prometheus:
- Fichier: `infrastructure/monitoring/prometheus/alerts.yml`

---

## 6. Production

### 6.1 Sécurité

**SSL/TLS**:
```bash
# Utiliser Certbot avec Nginx
certbot --nginx -d yourdomain.com
```

**Firewall**:
```bash
# Ouvrir uniquement les ports nécessaires
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Secrets**:
- Ne jamais commiter `.env`
- Utiliser un gestionnaire de secrets (HashiCorp Vault, etc.)

### 6.2 Performance

**GPU pour Ollama**:
Modifier `docker-compose.yml`:
```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

**Scaling**:
- Utiliser Kubernetes pour scaling horizontal
- Configurer auto-scaling basé sur CPU/mémoire

### 6.3 Backup

**PostgreSQL**:
```bash
# Backup quotidien
docker exec serein-postgres pg_dump -U serein serein > backup.sql
```

**Weaviate**:
Les données sont persistées dans le volume Docker.

**Redis**:
Optionnel (données temporaires).

---

## 7. Maintenance

### 7.1 Mise à Jour

```bash
# Mettre à jour les images Docker
docker-compose pull
docker-compose up -d
```

### 7.2 Logs

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f ollama
```

### 7.3 Nettoyage

```bash
# Supprimer les volumes non utilisés
docker volume prune

# Supprimer les images non utilisées
docker image prune
```

---

## 8. Dépannage

### 8.1 Ollama ne répond pas

```bash
# Vérifier les logs
docker-compose logs ollama

# Redémarrer
docker-compose restart ollama

# Vérifier que le modèle est téléchargé
docker exec serein-ollama ollama list
```

### 8.2 Weaviate ne démarre pas

```bash
# Vérifier les logs
docker-compose logs weaviate

# Vérifier l'espace disque
df -h
```

### 8.3 Problèmes de mémoire

```bash
# Vérifier l'utilisation
docker stats

# Réduire la taille des modèles Ollama
# Utiliser des modèles plus petits (mistral au lieu de llama2:70b)
```

---

## 9. Optimisation

### 9.1 Performance LLM

- Utiliser GPU si disponible
- Quantifier les modèles (réduire la précision pour gagner en vitesse)
- Utiliser des modèles plus petits pour questions simples

### 9.2 Cache

- Configurer Redis pour cache des réponses fréquentes
- Utiliser CDN pour assets statiques

### 9.3 Base de Données

- Optimiser les index PostgreSQL
- Configurer connection pooling
- Utiliser read replicas si nécessaire

---

## 10. Support

Pour toute question:
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter la communauté

---

**Note**: Ce guide est pour un déploiement self-hosted. Pour un déploiement cloud, voir la documentation Kubernetes.
