# Serein SDK

Lightweight TypeScript SDK for the Serein APIs.

## Install
```bash
npm install @serein/sdk
```

## Usage
```ts
import { SereinClient } from '@serein/sdk';

const client = new SereinClient({ baseUrl: 'http://localhost' });
const auth = await client.login({ email: 'test@example.com', password: 'password' });
client.setAccessToken(auth.accessToken);
const conversations = await client.getConversations();
```
