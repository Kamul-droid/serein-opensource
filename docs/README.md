# Documentation - Serein Open Source

Documentation complète de la version open source de Serein utilisant uniquement des technologies open source.

## Structure de la Documentation

### Documentation Spécifique Open Source
- [Roadmap de Développement](ROADMAP.md) - Feuille de route complète du développement
- [Architecture Système Open Source](architecture/system-architecture.md) - Architecture avec services open source
- [Stack Technologique Open Source](technology-stack.md) - Technologies open source recommandées
- [Guide de Déploiement Self-Hosted](deployment/self-hosted.md) - Guide complet de déploiement
- [Comparaison Standard vs Open Source](comparison.md) - Comparaison détaillée des deux versions

### Documentation Commune
- [Exigences Fonctionnelles](common/requirements/functional-requirements.md) - 56 exigences fonctionnelles
- [Exigences Non-Fonctionnelles](common/requirements/non-functional-requirements.md) - 76 exigences non-fonctionnelles
- [Architecture Système](common/architecture/system-architecture.md) - Architecture de base
- [Boundaries](common/architecture/boundaries.md) - Limites du système
- [Decision Log (ADR)](common/architecture/decision-log.md) - Décisions architecturales
- [Stratégie de Tests](common/testing/test-strategy.md) - Stratégie complète de tests

## Version

- **Version actuelle**: 1.0.0
- **Dernière mise à jour**: 09.01.2026
- **CHANGELOG**: [CHANGELOG.md](../CHANGELOG.md)

## Caractéristiques de cette Version

- ✅ Services IA open source (Ollama, Coqui TTS, Whisper)
- ✅ Vector DB open source (Weaviate/Qdrant)
- ✅ Monitoring open source (Prometheus, Grafana, Loki)
- ✅ Déploiement self-hosted
- ✅ Coûts: $50-200/mois (infrastructure uniquement)

## Services Open Source Utilisés

- **LLM**: Ollama (Llama, Mistral, Phi)
- **TTS**: Coqui TTS / Piper TTS
- **STT**: Whisper
- **Vector DB**: Weaviate / Qdrant
- **Monitoring**: Prometheus + Grafana
- **Logging**: Loki + Promtail
- **Tracing**: Jaeger

## Comparaison

Pour comparer avec la version standard, voir [Comparaison Standard vs Open Source](comparison.md).
