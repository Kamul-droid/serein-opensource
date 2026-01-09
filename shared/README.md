# Shared Package

Package partagé contenant les types, utilitaires et helpers communs à tous les services.

## Structure

```
shared/
├── types/          # Types TypeScript partagés
├── utils/          # Utilitaires partagés (logger, errors, etc.)
└── index.ts        # Exports principaux
```

## Utilisation

Dans un service, importez depuis `@serein/shared` :

```typescript
import { User, Conversation } from '@serein/shared/types';
import { createLogger } from '@serein/shared/utils/logger';
import { AppError, NotFoundError } from '@serein/shared/utils/errors';
```

## Build

```bash
npm run build
```

## Développement

```bash
npm run dev  # Watch mode
```
