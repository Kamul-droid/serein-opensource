# Shared Package

Shared package containing the types, utilities, and helpers used across all services.

## Structure

```
shared/
├── types/          # Shared TypeScript types
├── utils/          # Shared utilities (logger, errors, etc.)
└── index.ts        # Main exports
```

## Usage

In a service, import from `@serein/shared`:

```typescript
import { User, Conversation } from '@serein/shared/types';
import { createLogger } from '@serein/shared/utils/logger';
import { AppError, NotFoundError } from '@serein/shared/utils/errors';
```

## Build

```bash
npm run build
```

## Development

```bash
npm run dev  # Watch mode
```
