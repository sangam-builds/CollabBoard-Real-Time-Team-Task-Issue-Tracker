// Script to delete all database tables and drop the public schema in PostgreSQL
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function dropAllTables() {
  console.log('⚠️ WARNING: Deleting all database tables and dropping schema...');
  try {
    // Drop the entire public schema with CASCADE to remove all tables, enums, triggers, views, and sequences
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS public CASCADE;`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO public;`);

    console.log('✅ Successfully deleted all database tables and reset schema.');
  } catch (error) {
    console.error('❌ Failed to drop database tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

dropAllTables();
