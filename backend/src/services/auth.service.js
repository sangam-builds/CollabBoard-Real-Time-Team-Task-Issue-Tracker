const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const tokenBlacklist = require('../utils/tokenBlacklist');

const SALT_ROUNDS = 10;

const authService = {
  async register({ email, password, displayName }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ email, passwordHash, displayName });
    return authService.issueToken(user);
  },

  async login({ email, password }) {
    // 1. Authentication: Validate credentials
    const user = await userRepository.findByEmail(email);
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const passwordHash = user.passwordHash || user.password_hash;
    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    // 2. Authorization: Extract team roles and permissions for token claims
    const roles = (user.memberships || []).map((m) => ({
      teamId: m.teamId,
      role: m.role,
    }));

    return authService.issueToken(user, roles);
  },

  issueToken(user, roles = []) {
    const payload = {
      userId: user.id,
      email: user.email,
      roles,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.display_name,
        roles,
      },
    };
  },

  async logout(token, user) {
    // Token-based invalidation: Blacklist token so it can no longer authorize requests
    if (token) {
      tokenBlacklist.revoke(token);
    }
    return {
      success: true,
      message: 'Logged out successfully and token invalidated',
      user: user ? { id: user.id, email: user.email } : null,
    };
  },
};

module.exports = authService;
