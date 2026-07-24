const logger = require('../utils/logger');

// Logs every request with duration -- lets you see p95/p99 response times
// and spot slow endpoints once you're load-testing at 500 concurrent users.
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
}

module.exports = requestLogger;
