# Conversation Service

Conversation management service for Serein Open Source.

## Features

- Conversation CRUD
- Message storage
- Conversation history
- WebSocket streaming endpoint

## APIs

### Conversations

- `POST /conversations` - Create a conversation
- `GET /conversations` - List conversations
- `GET /conversations/:id` - Get a conversation
- `DELETE /conversations/:id` - Delete a conversation

### Messages

- `POST /conversations/:id/messages` - Create message
- `GET /conversations/:id/messages` - List messages

### Streaming

- `WebSocket /conversations/:id/stream` - Stream conversation responses

### Health Check

- `GET /health` - Service health check

**Note**: All routes require authentication (JWT token in Authorization header)

## Environment Variables

```env
PORT=3003
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

- `conversations` - Conversations
- `messages` - Conversation messages

## Testing

Tests are located in `tests/` directory:
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`

Target coverage: 80%
