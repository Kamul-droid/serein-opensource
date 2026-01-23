const parseList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
};

/**
 * Configuration for AI Service
 */
export const config = {
  port: parseInt(process.env.PORT || '3004', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama2',
    lightModels: parseList(process.env.OLLAMA_LIGHT_MODELS, ['phi', 'mistral']),
    heavyModels: parseList(process.env.OLLAMA_HEAVY_MODELS, ['llama2', 'mistral-large']),
    keepAlive: process.env.OLLAMA_KEEP_ALIVE || '10m',
    timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '60000', 10),
    retries: parseInt(process.env.OLLAMA_RETRIES || '2', 10),
    breakerThreshold: parseInt(process.env.OLLAMA_BREAKER_THRESHOLD || '3', 10),
    breakerCooldownMs: parseInt(process.env.OLLAMA_BREAKER_COOLDOWN_MS || '30000', 10),
  },
  domain: {
    strict: parseBoolean(process.env.AI_DOMAIN_STRICT, true),
    keywords: parseList(process.env.AI_DOMAIN_KEYWORDS, [
      'well-being',
      'well being',
      'wellbeing',
      'wellness',
      'mindfulness',
      'stress',
      'anxiety',
      'sleep',
      'meditation',
      'balance',
      'spiritual',
      'gratitude',
      'self-care',
      'breathing',
      'mental health',
      'meaning',
      'purpose',
      'values',
      'life',
      'growth',
      'resilience',
      'calm',
      'inner peace',
      'emotions',
      'feelings',
    ]),
    medicalKeywords: parseList(process.env.AI_MEDICAL_KEYWORDS, [
      'diagnose',
      'diagnosis',
      'treatment',
      'medication',
      'prescription',
      'symptom',
      'doctor',
      'disease',
      'illness',
      'injury',
      'therapy',
      'cancer',
      'heart',
      'blood pressure',
    ]),
    systemPrompt:
      process.env.AI_SYSTEM_PROMPT ||
      'You are Serein, a well-being assistant focused on well-being, spirituality, and philosophy. If the user has not shared beliefs or interests yet, start by asking about them and adapt follow-up questions based on their answers. Keep responses supportive and aligned with the well-being domain, and do not provide medical diagnosis. Do not introduce puzzles, logic games, or unrelated scenarios.',
    fallbackResponse:
      process.env.AI_DOMAIN_FALLBACK ||
      'I can help with well-being, mindfulness, spirituality, and personal growth. If you are open to it, share your beliefs and interests so we can begin.',
  },
};
