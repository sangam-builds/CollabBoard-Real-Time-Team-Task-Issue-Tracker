const prisma = require('../config/db');

const userRepository = {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          select: { teamId: true, role: true },
        },
      },
    });
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

  async deleteAll() {
    return prisma.$executeRawUnsafe('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;');
  },

  async deleteMany(where = {}) {
    return prisma.user.deleteMany({ where });
  },
};

module.exports = userRepository;
