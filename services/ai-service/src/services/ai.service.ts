import { config } from '../config';
import { createLogger } from '@serein/shared/utils/logger';
import { ServiceUnavailableError } from '@serein/shared/utils/errors';
import { AIResponse } from '@serein/shared/types';
import { ChatMessage, ChatRequest, ModelInfo, StreamResult, UserContext } from '../types';

const logger = createLogger('ai-service');

const breakerState = {
  failures: 0,
  openedUntil: 0,
};

const resourceSuggestions = [
  'Try a short breathing exercise (4-7-8) to calm the nervous system.',
  'Consider a brief gratitude journaling practice.',
  'Explore a guided meditation focused on mindfulness.',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toAsyncIterable = (body: unknown): AsyncIterable<Uint8Array> => {
  if (!body) {
    throw new Error('Missing response body');
  }

  if (typeof (body as AsyncIterable<Uint8Array>)[Symbol.asyncIterator] === 'function') {
    return body as AsyncIterable<Uint8Array>;
  }

  if (typeof (body as { getReader?: () => ReadableStreamDefaultReader<Uint8Array> }).getReader === 'function') {
    const reader = (body as ReadableStream<Uint8Array>).getReader();
    return {
      async *[Symbol.asyncIterator]() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            yield value;
          }
        }
      },
    };
  }

  throw new Error('Unsupported stream type');
};

const buildSystemPrompt = (context?: UserContext): string => {
  let prompt = config.domain.systemPrompt;

  if (context?.beliefs?.length) {
    prompt += `\nUser beliefs: ${context.beliefs.join(', ')}.`;
  }

  if (context?.interests?.length) {
    prompt += `\nUser interests: ${context.interests.join(', ')}.`;
  }

  return prompt;
};

const buildMessages = (messages: ChatMessage[], context?: UserContext): ChatMessage[] => {
  const systemPrompt = buildSystemPrompt(context);
  if (messages.length === 0) {
    return [{ role: 'system', content: systemPrompt }];
  }

  if (messages[0].role !== 'system') {
    return [{ role: 'system', content: systemPrompt }, ...messages];
  }

  return messages;
};

export const evaluateComplexity = (text: string): 'low' | 'medium' | 'high' => {
  const words = text.trim().split(/\s+/).length;
  const complexHints = ['analyze', 'compare', 'evaluate', 'strategy', 'framework', 'system'];
  const hasComplexHints = complexHints.some((hint) => text.includes(hint));

  if (words > 120 || hasComplexHints) {
    return 'high';
  }
  if (words < 25) {
    return 'low';
  }
  return 'medium';
};

export const selectModel = (messages: ChatMessage[], preferred?: string): string => {
  if (preferred) {
    return preferred;
  }

  const combined = messages.map((message) => message.content).join(' ').toLowerCase();
  const complexity = evaluateComplexity(combined);

  if (complexity === 'low' && config.ollama.lightModels.length > 0) {
    return config.ollama.lightModels[0];
  }

  if (complexity === 'high' && config.ollama.heavyModels.length > 0) {
    return config.ollama.heavyModels[0];
  }

  return config.ollama.defaultModel;
};

const isGreetingOrIntro = (text: string): boolean => {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) {
    return false;
  }

  const greetingHints = [
    'hello',
    'hi',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'start',
    'begin',
    'talk',
    'chat',
    'help',
  ];

  return greetingHints.some((hint) => trimmed.includes(hint));
};

export const applyDomainPolicy = (
  messages: ChatMessage[]
): { blocked: boolean; reason?: string } => {
  const userMessages = messages.filter((message) => message.role === 'user');
  const combined = userMessages.map((message) => message.content).join(' ').toLowerCase();
  const isMedical = config.domain.medicalKeywords.some((keyword) => combined.includes(keyword));
  const isWellbeing = config.domain.keywords.some((keyword) => combined.includes(keyword));
  const isInitialTurn = userMessages.length <= 1 && isGreetingOrIntro(combined);

  if (isMedical) {
    return { blocked: true, reason: 'medical' };
  }

  if (config.domain.strict && !isWellbeing && !isInitialTurn) {
    return { blocked: true, reason: 'out-of-domain' };
  }

  return { blocked: false };
};

const withCircuitBreaker = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (breakerState.openedUntil > Date.now()) {
    throw new ServiceUnavailableError('ollama', {
      reason: 'circuit-open',
    });
  }

  try {
    const result = await fn();
    breakerState.failures = 0;
    return result;
  } catch (error) {
    breakerState.failures += 1;
    if (breakerState.failures >= config.ollama.breakerThreshold) {
      breakerState.openedUntil = Date.now() + config.ollama.breakerCooldownMs;
    }
    throw error;
  }
};

const buildOllamaUrl = (path: string): string => {
  const baseUrl = config.ollama.baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

const requestOllama = async (
  path: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    stream?: boolean;
  }
): Promise<Response> => {
  const url = buildOllamaUrl(path);
  const method = options.method ?? 'POST';
  const payload = options.body ? JSON.stringify(options.body) : undefined;

  return withCircuitBreaker(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= config.ollama.retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.ollama.timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'content-type': 'application/json',
          },
          body: payload,
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Ollama error (${response.status}): ${text}`);
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < config.ollama.retries) {
          await sleep(250 * (attempt + 1));
          continue;
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    const errorPayload =
      lastError instanceof Error
        ? { message: lastError.message, stack: lastError.stack }
        : lastError;
    logger.error({ error: errorPayload }, 'Ollama request failed');
    throw new ServiceUnavailableError('ollama', {
      reason: 'request-failed',
    });
  });
};

export const getAvailableModels = async (): Promise<ModelInfo[]> => {
  const response = await requestOllama('/api/tags', { method: 'GET' });
  const data = (await response.json()) as {
    models?: Array<{ name: string; modified_at?: string; size?: number; digest?: string }>;
  };

  return (
    data.models?.map((model) => ({
      name: model.name,
      size: model.size,
      modifiedAt: model.modified_at,
      digest: model.digest,
    })) ?? []
  );
};

export const checkOllamaHealth = async (): Promise<boolean> => {
  try {
    await requestOllama('/api/tags', { method: 'GET' });
    return true;
  } catch (error) {
    logger.warn({ error }, 'Ollama health check failed');
    return false;
  }
};

const buildFallbackResponse = (model: string, reason: string): AIResponse => {
  const message =
    reason === 'medical'
      ? 'I am not a medical professional and cannot provide diagnosis or treatment. For health concerns, please consult a qualified professional. If you want well-being support, share your beliefs and interests to begin.'
      : config.domain.fallbackResponse;

  return {
    message,
    model,
    metadata: {
      blocked: true,
      reason,
      suggestions: resourceSuggestions,
    },
  };
};

const trimOffTopic = (message: string): string => {
  if (!message) {
    return message;
  }

  const markers = [
    '\n\n\n',
    'Consider the following scenario',
    "You've been tasked",
    'Here are some clues',
    'Question:',
    'Answer:',
  ];

  let earliest = -1;
  for (const marker of markers) {
    const index = message.indexOf(marker);
    if (index > 0 && (earliest === -1 || index < earliest)) {
      earliest = index;
    }
  }

  return earliest > 0 ? message.slice(0, earliest).trim() : message;
};

const normalizeResponse = (message: string, model: string): AIResponse => {
  const cleaned = trimOffTopic(message);
  if (!cleaned || cleaned.trim().length === 0) {
    return {
      message: "I don't know the best answer right now. Please consider a mindful pause or consult a trusted resource.",
      model,
      metadata: {
        suggestions: resourceSuggestions,
      },
    };
  }

  return {
    message: cleaned,
    model,
    metadata: {
      suggestions: resourceSuggestions,
    },
  };
};

const buildUnavailableResponse = (model: string): AIResponse => ({
  message: 'I am warming up right now. Please try again in a moment.',
  model,
  metadata: {
    unavailable: true,
    suggestions: resourceSuggestions,
  },
});

export const chat = async (request: ChatRequest): Promise<AIResponse> => {
  const policy = applyDomainPolicy(request.messages);
  const model = selectModel(request.messages, request.model);

  if (policy.blocked) {
    return buildFallbackResponse(model, policy.reason ?? 'blocked');
  }

  const messages = buildMessages(request.messages, request.userContext);
  let response: Response;
  try {
    response = await requestOllama('/api/chat', {
      body: {
        model,
        messages,
        stream: false,
        keep_alive: config.ollama.keepAlive,
        options: {
          temperature: request.temperature ?? 0.7,
        },
      },
    });
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return buildUnavailableResponse(model);
    }
    throw error;
  }

  const data = (await response.json()) as {
    message?: { content?: string };
    model?: string;
  };

  return normalizeResponse(data.message?.content ?? '', data.model ?? model);
};

export const streamChat = async (request: ChatRequest): Promise<StreamResult> => {
  const policy = applyDomainPolicy(request.messages);
  const model = selectModel(request.messages, request.model);

  if (policy.blocked) {
    return {
      type: 'blocked',
      response: buildFallbackResponse(model, policy.reason ?? 'blocked'),
    };
  }

  const messages = buildMessages(request.messages, request.userContext);
  let response: Response;
  try {
    response = await requestOllama('/api/chat', {
      body: {
        model,
        messages,
        stream: true,
        keep_alive: config.ollama.keepAlive,
        options: {
          temperature: request.temperature ?? 0.7,
        },
      },
    });
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return {
        type: 'blocked',
        response: buildUnavailableResponse(model),
      };
    }
    throw error;
  }

  const stream = toAsyncIterable(response.body);

  return {
    type: 'stream',
    model,
    stream,
  };
};
