const { PrismaClient } = require("@prisma/client");
const { buildUsers } = require("./seeds/users"); // adjust path to wherever you place this

const prisma = new PrismaClient();

async function main() {
  const users = await buildUsers();

  // upsert (not create) so re-running the seed doesn't blow up on unique
  // email constraints if you run `node prisma/seed.js` more than once locally
  const createdUsers = [];
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    createdUsers.push(created);
  }

  console.log(`Seeded ${createdUsers.length} users.`);

  // Keep a reference around — your Team/TeamMember seed step will need
  // these ids to assign sarah.chen as Owner, james/priya as Admin, etc.
  return createdUsers;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
