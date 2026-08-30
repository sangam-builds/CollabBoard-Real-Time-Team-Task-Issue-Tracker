const { z } = require('zod');
const authService = require('../services/auth.service');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authController = {
  async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const token = req.token || req.headers.authorization?.split(' ')[1];
      const result = await authService.logout(token, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      res.status(200).json({ user: req.user });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
