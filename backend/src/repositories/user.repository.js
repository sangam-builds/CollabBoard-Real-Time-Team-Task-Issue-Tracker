const prisma = require('../config/db');

const userRepository = {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
  },

  async create({ email, passwordHash, displayName }) {
    return prisma.user.create({
      data: { email, passwordHash, displayName },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
  },
};

module.exports = userRepository;
