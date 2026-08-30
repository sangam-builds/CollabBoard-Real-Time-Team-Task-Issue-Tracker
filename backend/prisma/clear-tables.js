// Script to delete/truncate all rows from all tables in the database while preserving table schemas
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllTables() {
  console.log('⚠️ Clearing all data from all database tables...');
  try {
    // Fetch all user table names in the public schema excluding migration history
    const tablesResult = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != '_prisma_migrations';
    `;

    if (!tablesResult || tablesResult.length === 0) {
      console.log('ℹ️ No user tables found to clear.');
      return;
    }

    const tableNames = tablesResult.map((t) => `"${t.tablename}"`).join(', ');

    // Truncate all tables with CASCADE to reset primary key identity sequences and handle foreign keys
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);

    console.log(`✅ Successfully cleared data from tables: ${tableNames}`);
  } catch (error) {
    console.error('❌ Failed to clear database tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllTables();
