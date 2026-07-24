// Structured JSON logging (Winston) instead of console.log -- this is what
// "monitoring" actually looks like: every request gets a request ID, status,
// and duration you can search/aggregate later.
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
