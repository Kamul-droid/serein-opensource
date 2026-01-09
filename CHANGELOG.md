# Changelog - Serein Open Source

Toutes les modifications notables de cette version seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### À venir
- Implémentation des services backend
- Interface frontend React
- Intégration avec services open source (Ollama, Coqui TTS, Whisper)
- Système de monitoring avec Prometheus + Grafana
- Guide de déploiement self-hosted complet

---

## [1.0.0] - 2026-01-09

### Ajouté
- Architecture système open source complète avec microservices
- Documentation des exigences fonctionnelles et non-fonctionnelles
- Stratégie de tests complète
- Stack technologique open source définie
- Configuration Docker Compose pour services open source (Ollama, Weaviate, Coqui TTS, Whisper, Prometheus, Grafana, Loki)
- Structure de projet organisée
- Boundaries et limitations du système documentées
- Decision Log (ADR) avec décisions architecturales open source
- Guide de déploiement self-hosted
- Comparaison détaillée avec version standard

### Documentation
- README.md avec guide de démarrage open source
- Documentation d'architecture open source complète
- Guide de déploiement self-hosted
- Documentation de comparaison Standard vs Open Source
- Guide de contribution

### Infrastructure
- Configuration Docker Compose complète (tous services open source)
- Configuration TypeScript, ESLint, Prettier, Jest
- Variables d'environnement pour services open source
- Scripts pour gestion Ollama et Weaviate

### Services Open Source
- Ollama pour LLM local (Llama, Mistral, Phi)
- Weaviate pour base de données vectorielle
- Coqui TTS pour synthèse vocale
- Whisper pour reconnaissance vocale
- Prometheus + Grafana pour monitoring
- Loki + Promtail pour logging
- Jaeger pour tracing distribué

---

## Format des Versions

- **[MAJOR.MINOR.PATCH]** - Format sémantique
- **MAJOR**: Changements incompatibles d'API
- **MINOR**: Nouvelles fonctionnalités rétrocompatibles
- **PATCH**: Corrections de bugs rétrocompatibles

---

## Types de Changements

- **Ajouté**: Nouvelles fonctionnalités
- **Modifié**: Changements dans les fonctionnalités existantes
- **Déprécié**: Fonctionnalités qui seront supprimées
- **Supprimé**: Fonctionnalités supprimées
- **Corrigé**: Corrections de bugs
- **Sécurité**: Corrections de vulnérabilités
