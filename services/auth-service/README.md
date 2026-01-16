# Auth Service

Authentication service for Serein Open Source.

## Features

- User registration and login
- JWT-based authentication (access + refresh tokens)
- Session management with Redis
- Password recovery (forgot/reset password)
- Password hashing with Argon2
- Input validation with Zod

## APIs

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/me` - Get current user (protected)

### Health Check

- `GET /health` - Service health check

## Environment Variables

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/serein
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_TIMEOUT_MS=3600000
CORS_ORIGIN=http://localhost:5173
```

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Database Schema

- `users` - User accounts
- `sessions` - Active user sessions
- `password_reset_tokens` - Password reset tokens

## Testing

Tests are located in `tests/` directory:
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`

Target coverage: 80%
