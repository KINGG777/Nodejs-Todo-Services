// src/metrics.js
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

// Register default metrics (CPU, memory, uptime, etc.)
collectDefaultMetrics({ prefix: 'node_app_' });

// Custom metric for tracking API requests
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.003, 0.03, 0.1, 0.3, 1.5, 10] // Buckets for response time
});

module.exports = { client, httpRequestDurationMicroseconds };
