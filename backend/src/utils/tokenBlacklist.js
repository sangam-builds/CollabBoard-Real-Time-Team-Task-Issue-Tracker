const jwt = require('jsonwebtoken');

// In-memory token revocation store for stateless JWT authentication.
// Revoked tokens are kept until their expiration time, after which
// they expire naturally and are pruned to prevent memory leaks.
const revokedTokens = new Map();

// Periodically clean up expired entries every 15 minutes
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, exp] of revokedTokens.entries()) {
    if (exp <= now) {
      revokedTokens.delete(token);
    }
  }
}, 15 * 60 * 1000).unref();

const tokenBlacklist = {
  revoke(token) {
    if (!token) return;
    try {
      const decoded = jwt.decode(token);
      const exp = decoded?.exp || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      revokedTokens.set(token, exp);
    } catch {
      revokedTokens.set(token, Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);
    }
  },

  isRevoked(token) {
    if (!token) return false;
    const exp = revokedTokens.get(token);
    if (!exp) return false;

    if (exp <= Math.floor(Date.now() / 1000)) {
      revokedTokens.delete(token);
      return false;
    }
    return true;
  },

  clear() {
    revokedTokens.clear();
  },
};

module.exports = tokenBlacklist;
