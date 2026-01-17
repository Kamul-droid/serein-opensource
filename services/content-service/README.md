# Content Service

Content and semantic search service for Serein Open Source.

## Features

- Book catalog stored in PostgreSQL
- Semantic search via Weaviate (fallback to database)
- Recommendations based on user beliefs
- Health checks for database and Weaviate

## APIs

- `POST /content/search` - Semantic search for books
- `GET /content/books` - List available books
- `GET /content/books/:id` - Book details
- `POST /content/recommendations` - Recommendations based on beliefs
- `GET /health` - Service health check

**Note**: All routes require authentication (JWT token in Authorization header)

## Environment Variables

```env
PORT=3005
CONTENT_DATABASE_URL=postgresql://user:password@localhost:5432/serein_content
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=
WEAVIATE_SCHEMA_CLASS=Book
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
