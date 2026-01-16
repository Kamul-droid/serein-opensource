# Self-Hosted Deployment Guide - Serein Open Source

## Version: 1.0
## Date: 09.01.2026

---

## 1. Overview

This guide helps you deploy Serein fully self-hosted on your own infrastructure.

---

## 2. Prerequisites

### 2.1 Infrastructure

**Minimum**:
- CPU: 8 cores
- RAM: 32 GB
- Storage: 500 GB SSD
- GPU: Optional (recommended for LLM)

**Recommended**:
- CPU: 16+ cores
- RAM: 64+ GB
- Storage: 1 TB+ SSD
- GPU: NVIDIA with 16+ GB VRAM (for local LLM)

### 2.2 Software

- Docker 24.0+
- Docker Compose 2.0+
- Node.js 20 LTS+ (for development)
- Git

### 2.3 Optional

- Kubernetes (for production)
- Nginx (for reverse proxy)
- Certbot (for SSL/TLS)

---

## 3. Installation

### 3.1 Clone the Repository

```bash
git clone https://github.com/your-org/serein-opensource.git
cd serein-opensource
```

### 3.2 Configuration

```bash
# Copy the environment file
cp env.example .env

# Edit environment variables
nano .env
```

### 3.3 Start Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 3.4 Initialize Ollama (LLM)

```bash
# Download a model (e.g., Llama 2)
docker exec serein-ollama ollama pull llama2

# Or Mistral (lighter)
docker exec serein-ollama ollama pull mistral

# List available models
docker exec serein-ollama ollama list
```

### 3.5 Initialize Weaviate

Weaviate starts automatically. Verify with:

```bash
curl http://localhost:8080/v1/.well-known/ready
```

---

## 4. Service Configuration

### 4.1 Ollama (LLM)

**Available models**:
- `llama2` - 7B parameters (recommended to start)
- `mistral` - 7B parameters (fast)
- `llama2:13b` - 13B parameters (better quality)
- `llama2:70b` - 70B parameters (best quality, requires GPU)

**Download a model**:
```bash
docker exec serein-ollama ollama pull llama2
```

**Use a specific model**:
Update `OLLAMA_DEFAULT_MODEL` in `.env`

### 4.2 Coqui TTS

**Available voices**:
- `tts_models/fr/css10/vits` - French
- `tts_models/en/ljspeech/tacotron2-DDC` - English

**Configuration**:
Update `COQUI_TTS_DEFAULT_VOICE` in `.env`

### 4.3 Whisper

**Available models**:
- `tiny` - Faster, less accurate
- `base` - Balanced (recommended)
- `small` - Better quality
- `medium` - Very good quality
- `large` - Best quality (requires more RAM)

**Configuration**:
Update `WHISPER_MODEL` in `.env`

### 4.4 Weaviate

**Schema**:
The schema is created automatically on first startup.

**Indexing data**:
See the Content Service API documentation.

---

## 5. Monitoring

### 5.1 Access Interfaces

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

### 5.2 Grafana Configuration

1. Log in to Grafana
2. Add Prometheus as a datasource (http://prometheus:9090)
3. Import dashboards from `infrastructure/monitoring/grafana/dashboards`

### 5.3 Alerts

Configure alerts in Prometheus:
- File: `infrastructure/monitoring/prometheus/alerts.yml`

---

## 6. Production

### 6.1 Security

**SSL/TLS**:
```bash
# Use Certbot with Nginx
certbot --nginx -d yourdomain.com
```

**Firewall**:
```bash
# Open only required ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Secrets**:
- Never commit `.env`
- Use a secrets manager (HashiCorp Vault, etc.)

### 6.2 Performance

**GPU for Ollama**:
Edit `docker-compose.yml`:
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
- Use Kubernetes for horizontal scaling
- Configure auto-scaling based on CPU/memory

### 6.3 Backup

**PostgreSQL**:
```bash
# Daily backup
docker exec serein-postgres pg_dump -U serein serein > backup.sql
```

**Weaviate**:
Data is persisted in the Docker volume.

**Redis**:
Optional (temporary data).

---

## 7. Maintenance

### 7.1 Updates

```bash
# Update Docker images
docker-compose pull
docker-compose up -d
```

### 7.2 Logs

```bash
# View logs for all services
docker-compose logs -f

# Logs for a specific service
docker-compose logs -f ollama
```

### 7.3 Cleanup

```bash
# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune
```

---

## 8. Troubleshooting

### 8.1 Ollama not responding

```bash
# Check logs
docker-compose logs ollama

# Restart
docker-compose restart ollama

# Verify model download
docker exec serein-ollama ollama list
```

### 8.2 Weaviate not starting

```bash
# Check logs
docker-compose logs weaviate

# Check disk space
df -h
```

### 8.3 Memory issues

```bash
# Check usage
docker stats

# Reduce Ollama model size
# Use smaller models (mistral instead of llama2:70b)
```

---

## 9. Optimization

### 9.1 LLM Performance

- Use GPU if available
- Quantize models (reduce precision for speed)
- Use smaller models for simple questions

### 9.2 Cache

- Configure Redis to cache frequent responses
- Use a CDN for static assets

### 9.3 Database

- Optimize PostgreSQL indexes
- Configure connection pooling
- Use read replicas if needed

---

## 10. Support

For questions:
- Open an issue on GitHub
- Check the documentation
- Contact the community

---

**Note**: This guide is for self-hosted deployment. For cloud deployment, see the Kubernetes documentation.
