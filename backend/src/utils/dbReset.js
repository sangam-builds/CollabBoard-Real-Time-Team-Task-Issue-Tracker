const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();

/**
 * Completely drops all database tables, views, custom enum types, and resets the schema.
 */
async function dropAllTables() {
  logger.warn('Dropping all database tables and schema...');
  try {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS public CASCADE;`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO public;`);
    logger.info('Database schema and all tables dropped successfully.');
    return true;
  } catch (error) {
    logger.error('Error dropping database tables:', error);
    throw error;
  }
}

/**
 * Truncates and deletes all data from all user tables while leaving table structures intact.
 */
async function clearAllTables() {
  logger.warn('Clearing all data from database tables...');
  try {
    const tablesResult = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != '_prisma_migrations';
    `;

    if (!tablesResult || tablesResult.length === 0) {
      logger.info('No database tables found to truncate.');
      return true;
    }

    const tableNames = tablesResult.map((t) => `"${t.tablename}"`).join(', ');
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
    logger.info(`Truncated data from tables: ${tableNames}`);
    return true;
  } catch (error) {
    logger.error('Error truncating database tables:', error);
    throw error;
  }
}

module.exports = {
  dropAllTables,
  clearAllTables,
};
