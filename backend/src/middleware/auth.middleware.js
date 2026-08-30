const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../utils/tokenBlacklist');

// Verifies the JWT and attaches { id, email, roles } to req.user.
// Also verifies that the token has not been revoked/logged out.
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = header.split(' ')[1];

  if (tokenBlacklist.isRevoked(token)) {
    return res.status(401).json({ error: 'Token has been revoked. Please log in again.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.token = token;
    req.user = {
      id: payload.userId,
      email: payload.email,
      roles: payload.roles || [],
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
