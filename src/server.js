// src/server.js
const express = require('express');
const helmet = require('helmet'); // Security best practice
const todoRoutes = require('./routes/todo');
const logger = require('./logger');
const { client, httpRequestDurationMicroseconds } = require('./metrics');
const COMMIT_SHA = process.env.COMMIT_SHA || 'unknown';

const createServer = () => {
  const app = express();

  // Security Middleware
  app.use(helmet());

  // Body Parsing Middleware
  app.use(express.json());

  // Request Logging Middleware (Basic request logging)
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const duration = (process.hrtime.bigint() - start) / BigInt(1e6); // duration in ms
      logger.info('Request handled', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration_ms: Number(duration),
        ip: req.ip
      });
      // Observe request metrics
      httpRequestDurationMicroseconds
        .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
        .observe(Number(duration) / 1000); // observe in seconds
    });
    next();
  });

  // Health Check Endpoint
  // GET /healthz -> { status: "ok", commit: <sha> }
  app.get('/healthz', (req, res) => {
    res.json({
      status: 'ok',
      commit: COMMIT_SHA
    });
  });

  // Metrics Endpoint (Prometheus client)
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });

  // API Routes
  app.use('/api/v1/todos', todoRoutes);

  // Fallback 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
};

module.exports = createServer;
