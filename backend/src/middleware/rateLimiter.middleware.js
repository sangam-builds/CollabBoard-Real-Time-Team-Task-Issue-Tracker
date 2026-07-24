const rateLimit = require('express-rate-limit');

// Basic protection so a single misbehaving client can't monopolize the pool
// under load. Tuned loosely for ~500 active users; adjust after real traffic data.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 120 requests/minute/IP is generous for normal UI usage, tight enough to catch runaway loops
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

module.exports = { apiLimiter };
