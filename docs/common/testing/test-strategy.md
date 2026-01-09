# Stratégie de Tests - Plateforme IA de Bien-être

## Version: 1.0
## Date: 09.01.2026

---

## 1. Vue d'Ensemble

### 1.1 Objectifs des Tests

- **Qualité**: Assurer la qualité du code et des fonctionnalités
- **Fiabilité**: Garantir la stabilité du système
- **Sécurité**: Vérifier la sécurité des données et des APIs
- **Performance**: Valider les performances et la scalabilité
- **Maintenabilité**: Faciliter la maintenance et l'évolution

### 1.2 Pyramide de Tests

```
                    /\
                   /  \
                  / E2E \
                 /--------\
                /          \
               / Integration \
              /--------------\
             /                \
            /     Unit Tests    \
           /----------------------\
```

- **Unit Tests (70%)**: Tests unitaires rapides et isolés
- **Integration Tests (20%)**: Tests d'intégration entre composants
- **E2E Tests (10%)**: Tests end-to-end des scénarios utilisateur

---

## 2. Tests Unitaires

### 2.1 Portée

**Services Backend**:
- Logique métier
- Validation des données
- Transformation des données
- Calculs et algorithmes

**Composants Frontend**:
- Composants React isolés
- Hooks personnalisés
- Utilitaires et helpers
- Gestion d'état

**SDK**:
- Clients API
- Transformation des requêtes/réponses
- Gestion des erreurs

### 2.2 Outils

**Backend (Node.js/TypeScript)**:
- **Jest**: Framework de test principal
- **Sinon**: Mocks et stubs
- **Supertest**: Tests d'API HTTP

**Frontend (React)**:
- **Jest**: Framework de test
- **React Testing Library**: Tests de composants React
- **MSW (Mock Service Worker)**: Mock des APIs

**Coverage**:
- Objectif: **80% minimum** de couverture de code
- Outil: Jest coverage ou Istanbul

### 2.3 Exemples de Tests

#### Test Backend (Service)

```typescript
describe('ConversationService', () => {
  describe('createConversation', () => {
    it('should create a new conversation for a user', async () => {
      const userId = 'user-123';
      const conversation = await conversationService.createConversation(userId);
      
      expect(conversation).toBeDefined();
      expect(conversation.userId).toBe(userId);
      expect(conversation.id).toBeDefined();
    });

    it('should throw error if user does not exist', async () => {
      await expect(
        conversationService.createConversation('invalid-user')
      ).rejects.toThrow('User not found');
    });
  });
});
```

#### Test Frontend (Composant)

```typescript
describe('ChatComponent', () => {
  it('should render chat interface', () => {
    render(<ChatComponent />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Envoyer')).toBeInTheDocument();
  });

  it('should send message when form is submitted', async () => {
    const mockSendMessage = jest.fn();
    render(<ChatComponent onSendMessage={mockSendMessage} />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByText('Envoyer');
    
    fireEvent.change(input, { target: { value: 'Bonjour' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Bonjour');
    });
  });
});
```

---

## 3. Tests d'Intégration

### 3.1 Portée

**Services ↔ Base de Données**:
- CRUD operations
- Requêtes complexes
- Transactions
- Migrations

**Services ↔ Services Externes**:
- Appels API externes (IA, TTS, STT)
- Gestion des erreurs
- Retry logic
- Timeouts

**Services ↔ Services Internes**:
- Communication entre microservices
- Event handling
- Message queues

**Frontend ↔ Backend**:
- Appels API
- Authentification
- Gestion des erreurs
- WebSocket connections

### 3.2 Outils

- **Jest**: Tests d'intégration
- **Docker Compose**: Environnement de test isolé
- **Testcontainers**: Containers pour bases de données de test
- **Nock**: Mock des requêtes HTTP externes

### 3.3 Exemples de Tests

#### Test Service ↔ Database

```typescript
describe('ConversationService Integration', () => {
  let db: Database;
  
  beforeAll(async () => {
    db = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase(db);
  });

  it('should save and retrieve conversation', async () => {
    const userId = 'user-123';
    const conversation = await conversationService.createConversation(userId);
    
    const retrieved = await conversationService.getConversation(conversation.id);
    
    expect(retrieved).toMatchObject({
      id: conversation.id,
      userId: userId
    });
  });
});
```

#### Test Service ↔ External API

```typescript
describe('AIService Integration', () => {
  it('should call AI service and return response', async () => {
    const response = await aiService.chat({
      message: 'Bonjour',
      conversationId: 'conv-123'
    });
    
    expect(response).toBeDefined();
    expect(response.message).toBeDefined();
    expect(response.model).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    // Mock service unavailable
    nock('http://localhost:11434')
      .post('/api/generate')
      .reply(500, { error: 'Internal Server Error' });
    
    await expect(
      aiService.chat({ message: 'Test', conversationId: 'conv-123' })
    ).rejects.toThrow('AI service unavailable');
  });
});
```

**Note**: Les tests d'intégration avec services externes diffèrent selon la version (cloud vs local).

---

## 4. Tests End-to-End (E2E)

### 4.1 Portée

**Scénarios Utilisateur Complets**:
- Inscription et connexion
- Création de profil avec croyances
- Conversation complète (texte et vocal)
- Consultation de l'historique
- Gestion des préférences

**Flux Critiques**:
- Parcours utilisateur complet
- Gestion des erreurs utilisateur
- Performance des interactions
- Sécurité (authentification, autorisation)

### 4.2 Outils

- **Playwright**: Tests E2E cross-browser
- **Cypress**: Alternative pour tests E2E
- **Docker Compose**: Stack complète pour tests

### 4.3 Exemples de Tests

```typescript
describe('User Journey E2E', () => {
  it('should complete full user journey', async () => {
    // 1. Registration
    await page.goto('http://localhost:3000/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. Profile setup
    await page.waitForURL('**/profile');
    await page.fill('[name="beliefs"]', 'Bouddhisme, Méditation');
    await page.click('button:has-text("Continuer")');
    
    // 3. Start conversation
    await page.waitForURL('**/chat');
    await page.fill('[data-testid="message-input"]', 'Bonjour, je cherche des livres sur la méditation');
    await page.click('[data-testid="send-button"]');
    
    // 4. Verify response
    await page.waitForSelector('[data-testid="ai-message"]');
    const response = await page.textContent('[data-testid="ai-message"]');
    expect(response).toContain('méditation');
    
    // 5. Check history
    await page.click('[data-testid="history-button"]');
    await page.waitForSelector('[data-testid="conversation-list"]');
    const conversations = await page.$$('[data-testid="conversation-item"]');
    expect(conversations.length).toBeGreaterThan(0);
  });
});
```

---

## 5. Tests de Performance

### 5.1 Portée

- **Load Testing**: Charge normale et pic
- **Stress Testing**: Au-delà de la capacité normale
- **Spike Testing**: Augmentation soudaine de charge
- **Endurance Testing**: Charge prolongée

### 5.2 Outils

- **k6**: Tests de charge
- **Artillery**: Alternative pour tests de charge
- **Apache JMeter**: Tests de performance

### 5.3 Métriques

- **Temps de réponse**: P50, P95, P99
- **Throughput**: Requêtes par seconde
- **Erreur rate**: Taux d'erreur
- **Resource usage**: CPU, mémoire, réseau

---

## 6. Tests de Sécurité

### 6.1 Portée

- **Authentification**: Tests de login, tokens, sessions
- **Autorisation**: Tests de permissions, RBAC
- **Input Validation**: Injection SQL, XSS, CSRF
- **Data Protection**: Chiffrement, données sensibles
- **API Security**: Rate limiting, CORS, headers

### 6.2 Outils

- **OWASP ZAP**: Tests de sécurité
- **Burp Suite**: Tests de sécurité avancés
- **Jest**: Tests de sécurité unitaires

### 6.3 Exemples de Tests

```typescript
describe('Security Tests', () => {
  it('should reject invalid JWT tokens', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/conversations')
      .send({ title: maliciousInput })
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(101).fill(null).map(() =>
      request(app).get('/api/endpoint')
    );
    
    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];
    
    expect(lastResponse.status).toBe(429); // Too Many Requests
  });
});
```

---

## 7. Tests de Domaine (AI)

### 7.1 Portée

- **Limitation du Domaine**: Vérifier que l'IA reste dans le domaine bien-être
- **Détection Médicale**: Vérifier la détection et redirection des questions médicales
- **Qualité des Réponses**: Vérifier la pertinence des réponses
- **Sélection de Modèle**: Vérifier la logique de sélection de modèle

### 7.2 Exemples de Tests

```typescript
describe('AI Domain Tests', () => {
  it('should redirect medical questions', async () => {
    const response = await aiService.chat({
      message: 'J\'ai mal à la tête, que dois-je faire?',
      conversationId: 'conv-123'
    });
    
    expect(response.message).toContain('professionnel de santé');
    expect(response.message).toContain('ne remplace pas');
  });

  it('should stay within wellness domain', async () => {
    const response = await aiService.chat({
      message: 'Comment méditer?',
      conversationId: 'conv-123'
    });
    
    expect(response.message).not.toContain('médical');
    expect(response.domain).toBe('wellness');
  });

  it('should use appropriate model based on complexity', async () => {
    const simpleResponse = await aiService.chat({
      message: 'Bonjour',
      conversationId: 'conv-123'
    });
    // Version Standard: expect(simpleResponse.model).toMatch(/gpt-3.5|claude-haiku/);
    // Version Open Source: expect(simpleResponse.model).toMatch(/phi|mistral-7b/);
    
    const complexResponse = await aiService.chat({
      message: 'Explique-moi en détail la philosophie bouddhiste et ses applications modernes',
      conversationId: 'conv-123'
    });
    // Version Standard: expect(complexResponse.model).toMatch(/gpt-4|claude-sonnet/);
    // Version Open Source: expect(complexResponse.model).toMatch(/llama2-70b|mistral-large/);
  });
});
```

---

## 8. Structure des Tests

### 8.1 Organisation

```
tests/
├── unit/
│   ├── services/
│   ├── components/
│   ├── utils/
│   └── sdk/
├── integration/
│   ├── api/
│   ├── database/
│   └── external-services/
├── e2e/
│   ├── user-journeys/
│   ├── critical-flows/
│   └── error-scenarios/
├── performance/
│   ├── load/
│   ├── stress/
│   └── spike/
├── security/
│   ├── authentication/
│   ├── authorization/
│   └── input-validation/
└── fixtures/
    ├── data/
    └── mocks/
```

---

## 9. CI/CD Integration

### 9.1 Pipeline de Tests

1. **Lint & Format**: Vérification du code
2. **Unit Tests**: Tests unitaires rapides
3. **Integration Tests**: Tests d'intégration
4. **E2E Tests**: Tests end-to-end (optionnel en CI, obligatoire en staging)
5. **Security Tests**: Tests de sécurité
6. **Performance Tests**: Tests de performance (optionnel)

### 9.2 Configuration CI

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:security
      - run: npm run test:coverage
```

---

## 10. Objectifs de Couverture

- **Unit Tests**: 80% minimum
- **Integration Tests**: 70% minimum des intégrations critiques
- **E2E Tests**: 100% des scénarios critiques
- **Security Tests**: 100% des endpoints et fonctionnalités sensibles

---

## 11. Outils et Technologies

### 11.1 Stack de Tests

**Backend**:
- Jest
- Supertest
- Sinon
- Testcontainers

**Frontend**:
- Jest
- React Testing Library
- MSW
- Playwright

**E2E**:
- Playwright
- Cypress (alternative)

**Performance**:
- k6
- Artillery

**Security**:
- OWASP ZAP
- Jest (tests de sécurité)

**Coverage**:
- Jest Coverage
- Istanbul

---

**Note**: Cette stratégie de tests est commune aux deux versions. Les implémentations peuvent différer selon les services utilisés (cloud vs open source).
