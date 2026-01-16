# User Service

User profile and preferences service for Serein Open Source.

## Features

- User profile management
- User preferences (voice, communication mode)
- User beliefs and interests
- CRUD operations for user data

## APIs

### Profile

- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

### Preferences

- `GET /users/me/preferences` - Get user preferences
- `PUT /users/me/preferences` - Update user preferences

### Beliefs

- `GET /users/me/beliefs` - Get user beliefs
- `PUT /users/me/beliefs` - Update user beliefs

### Interests

- `GET /users/me/interests` - Get user interests
- `PUT /users/me/interests` - Update user interests

### Health Check

- `GET /health` - Service health check

**Note**: All routes require authentication (JWT token in Authorization header)

## Environment Variables

```env
PORT=3002
DATABASE_URL=postgresql://user:password@localhost:5432/serein
JWT_SECRET=your-secret-key
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

- `user_profiles` - User profiles
- `user_beliefs` - User beliefs
- `user_interests` - User interests
- `user_preferences` - User preferences

## Testing

Tests are located in `tests/` directory:
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`

Target coverage: 80%
