const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

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
    const user = await userRepository.findByEmail(email);
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const passwordHash = user.passwordHash || user.password_hash;
    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    return authService.issueToken(user);
  },

  issueToken(user) {
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return { token, user: { id: user.id, email: user.email, displayName: user.displayName || user.display_name } };
  },
};

module.exports = authService;
