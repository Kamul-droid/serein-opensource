type Logger = {
  info: (obj: Record<string, unknown>, msg?: string) => void;
  warn: (obj: Record<string, unknown>, msg?: string) => void;
  error: (obj: Record<string, unknown>, msg?: string) => void;
};

type StartupInfo = {
  service: string;
  port: number;
  nodeEnv: string;
  dependencies?: Record<string, unknown>;
  config?: Record<string, unknown>;
  requiredEnv?: string[];
  optionalEnv?: string[];
};

const redactKey = (key: string): boolean => {
  const lowered = key.toLowerCase();
  return (
    lowered.includes('secret') ||
    lowered.includes('password') ||
    lowered.includes('token') ||
    lowered.includes('apikey') ||
    lowered.includes('api_key')
  );
};

const redactUrlCredentials = (value: string): string => {
  try {
    const url = new URL(value);
    if (url.username || url.password) {
      url.username = '***';
      url.password = '***';
    }
    return url.toString();
  } catch {
    return value;
  }
};

const sanitizeValue = (key: string, value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    if (redactKey(key)) {
      return '***';
    }
    if (value.includes('://')) {
      return redactUrlCredentials(value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(key, item));
  }

  if (typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>);
  }

  return value;
};

const sanitizeObject = (input: Record<string, unknown>): Record<string, unknown> => {
  return Object.entries(input).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = sanitizeValue(key, value);
    return acc;
  }, {});
};

const envPresence = (keys: string[] | undefined): Record<string, boolean> | undefined => {
  if (!keys || keys.length === 0) {
    return undefined;
  }
  return keys.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = Boolean(process.env[key]);
    return acc;
  }, {});
};

export const logStartupInfo = (logger: Logger, info: StartupInfo): void => {
  const requiredMissing = (info.requiredEnv || []).filter((key) => !process.env[key]);

  if (requiredMissing.length > 0) {
    logger.warn({ requiredMissing }, 'Missing required environment variables');
  }

  logger.info(
    {
      service: info.service,
      port: info.port,
      nodeEnv: info.nodeEnv,
      process: {
        pid: process.pid,
        node: process.version,
        platform: process.platform,
      },
      dependencies: info.dependencies ? sanitizeObject(info.dependencies) : undefined,
      config: info.config ? sanitizeObject(info.config) : undefined,
      requiredEnv: envPresence(info.requiredEnv),
      optionalEnv: envPresence(info.optionalEnv),
    },
    'Service starting'
  );
};

export const attachProcessHandlers = (logger: Logger, service: string): void => {
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason, service }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error({ error, service }, 'Uncaught exception');
  });
};
