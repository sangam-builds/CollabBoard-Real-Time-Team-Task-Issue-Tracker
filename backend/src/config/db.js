// Single shared Prisma client instance.
// Connection pooling is now handled by Supabase's pgbouncer (the pooled
// DATABASE_URL), not by Prisma/pg directly -- that's why there's no pool-size
// config here anymore. In dev, this also guards against creating a new
// PrismaClient on every hot-reload (a common source of "too many connections"
// errors against Supabase).
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
