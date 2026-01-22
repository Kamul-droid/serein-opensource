import client from 'prom-client';

export type ServiceMetrics = {
  register: client.Registry;
  httpRequestsTotal: client.Counter<'method' | 'route' | 'status_code'>;
  httpRequestDurationSeconds: client.Histogram<'method' | 'route' | 'status_code'>;
};

export const createMetrics = (serviceName: string): ServiceMetrics => {
  const register = new client.Registry();
  register.setDefaultLabels({ service: serviceName });

  client.collectDefaultMetrics({ register });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  });

  register.registerMetric(httpRequestsTotal);
  register.registerMetric(httpRequestDurationSeconds);

  return {
    register,
    httpRequestsTotal,
    httpRequestDurationSeconds,
  };
};
