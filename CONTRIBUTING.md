# Guide de Contribution

Merci de votre intérêt pour contribuer à Serein ! Ce document fournit des lignes directrices pour contribuer au projet.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)

## 📜 Code de Conduite

Ce projet adhère à un code de conduite. En participant, vous êtes tenu de maintenir ce code.

## 🤝 Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les issues
2. Créez une nouvelle issue avec le label `bug`
3. Incluez:
   - Description claire du bug
   - Étapes pour reproduire
   - Comportement attendu vs comportement actuel
   - Environnement (OS, navigateur, version Node.js)

### Proposer une Fonctionnalité

1. Vérifiez que la fonctionnalité n'a pas déjà été proposée
2. Créez une nouvelle issue avec le label `feature`
3. Incluez:
   - Description de la fonctionnalité
   - Cas d'usage
   - Alternatives considérées

### Soumettre une Pull Request

1. Fork le repository
2. Créez une branche depuis `main`: `git checkout -b feature/ma-fonctionnalite`
3. Faites vos modifications
4. Ajoutez des tests pour vos modifications
5. Assurez-vous que tous les tests passent: `npm test`
6. Assurez-vous que le linting passe: `npm run lint`
7. Committez vos changements: `git commit -m 'feat: ajout de ma fonctionnalité'`
8. Push vers votre fork: `git push origin feature/ma-fonctionnalite`
9. Ouvrez une Pull Request

## 🔄 Processus de Développement

### Workflow Git

- `main`: Branche principale, toujours stable
- `develop`: Branche de développement
- `feature/*`: Nouvelles fonctionnalités
- `fix/*`: Corrections de bugs
- `docs/*`: Documentation
- `refactor/*`: Refactoring

### Convention de Commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

Exemple:
```
feat(conversation): ajout du support de la voix masculine
fix(auth): correction du bug de session timeout
docs(readme): mise à jour de la documentation d'installation
```

## 📝 Standards de Code

### TypeScript

- Utilisez TypeScript pour tout le code
- Évitez `any`, utilisez des types explicites
- Documentez les fonctions complexes avec JSDoc

### Formatage

- Utilisez Prettier pour le formatage automatique
- Exécutez `npm run format` avant de committer

### Linting

- Utilisez ESLint pour le linting
- Corrigez tous les warnings avant de soumettre une PR

### Structure de Code

- Un fichier = une responsabilité
- Fonctions courtes et focalisées
- Nommage explicite et descriptif

## 🧪 Tests

### Exigences

- Tous les nouveaux code doivent avoir des tests
- Couverture minimale de 80%
- Tests unitaires pour la logique métier
- Tests d'intégration pour les APIs
- Tests E2E pour les scénarios critiques

### Exécution des Tests

```bash
# Tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📚 Documentation

### Code

- Documentez les fonctions publiques avec JSDoc
- Ajoutez des commentaires pour la logique complexe
- Gardez les commentaires à jour avec le code

### API

- Documentez les endpoints avec OpenAPI/Swagger
- Incluez des exemples de requêtes/réponses
- Documentez les codes d'erreur

### README

- Mettez à jour le README si nécessaire
- Ajoutez des exemples d'utilisation
- Documentez les changements majeurs

## ✅ Checklist PR

Avant de soumettre une PR, assurez-vous que:

- [ ] Le code suit les standards du projet
- [ ] Tous les tests passent
- [ ] La couverture de tests est maintenue (≥80%)
- [ ] Le linting passe sans erreurs
- [ ] La documentation est à jour
- [ ] Les commits suivent la convention
- [ ] La PR a une description claire
- [ ] Les reviewers sont assignés

## 🎯 Review Process

1. Un maintainer sera assigné à votre PR
2. Le review peut prendre quelques jours
3. Des changements peuvent être demandés
4. Une fois approuvée, la PR sera mergée

## 📞 Questions?

Si vous avez des questions, n'hésitez pas à:
- Ouvrir une issue avec le label `question`
- Contacter les maintainers

Merci de contribuer à Serein ! 🎉

