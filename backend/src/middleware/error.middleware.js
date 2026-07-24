const logger = require('../utils/logger');

// Centralized error handler -- keeps controllers free of try/catch boilerplate
// for unexpected errors (validation errors are still handled explicitly per-route).
function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });
  const status = err.status || 500;
  if (typeof res.status === 'function') {
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
  } else {
    res.statusCode = status;
    res.end(JSON.stringify({ error: status === 500 ? 'Internal server error' : err.message }));
  }
}

module.exports = errorMiddleware;
