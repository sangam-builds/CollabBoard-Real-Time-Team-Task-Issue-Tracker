const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const requestLogger = require('./middleware/requestLogger.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const teamRoutes = require('./routes/team.routes');
const healthRoutes = require('./routes/health.routes');

function createApp(io = null) {
  const app = express();

  app.use(helmet());
  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? (process.env.CLIENT_ORIGIN.includes(',')
        ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
        : process.env.CLIENT_ORIGIN)
    : true;

  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());
  app.use(requestLogger);
  app.use(apiLimiter);

  // Attach io to every request so controllers can broadcast without a circular import.
  app.use((req, res, next) => {
    req.io = io || app.get('io');
    next();
  });

  app.use(healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api', taskRoutes);
  app.use('/api', teamRoutes);

  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
