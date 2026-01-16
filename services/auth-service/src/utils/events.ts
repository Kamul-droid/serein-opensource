import { config } from '../config';
import { createLogger } from '@serein/shared/utils/logger';

const logger = createLogger('auth-service:events');

type UserCreatedEvent = {
  userId: string;
  email: string;
};

async function postEvent(url: string, payload: UserCreatedEvent): Promise<void> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (config.events.secret) {
    headers['x-internal-secret'] = config.events.secret;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Event request failed (${response.status}): ${text}`);
  }
}

export async function emitUserCreatedEvent(payload: UserCreatedEvent): Promise<void> {
  const targets = [
    `${config.services.userUrl}/internal/events/user-created`,
    `${config.services.conversationUrl}/internal/events/user-created`,
  ];

  const results = await Promise.allSettled(targets.map((url) => postEvent(url, payload)));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.warn(
        { error: result.reason, target: targets[index], userId: payload.userId },
        'User created event delivery failed'
      );
    }
  });
}
