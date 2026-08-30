require('dotenv').config();
const prisma = require('../src/config/db');

async function deleteAllUsers() {
  console.log('⚠️ Deleting all users from the database...');
  try {
    // Using TRUNCATE TABLE users with CASCADE to safely clean up all dependent rows
    // (teams, tasks, comments, activity logs, notifications) and reset autoincrement ID
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;');
    console.log('✅ Successfully deleted all users and reset the users table identity.');
  } catch (error) {
    console.error('❌ Failed to delete users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  deleteAllUsers();
}

module.exports = { deleteAllUsers };
