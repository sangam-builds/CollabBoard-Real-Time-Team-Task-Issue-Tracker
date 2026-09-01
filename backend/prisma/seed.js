const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const DEV_PASSWORD = 'Password123!';
const SALT_ROUNDS = 10;

async function main() {
  console.log('Seeding full database...');

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  // 1. Ensure users exist
  const seedUsers = [
    { email: 'sarah.chen@collabboard.dev', displayName: 'Sarah Chen' },
    { email: 'james.okafor@collabboard.dev', displayName: 'James Okafor' },
    { email: 'priya.nair@collabboard.dev', displayName: 'Priya Nair' },
    { email: 'maya.lindqvist@collabboard.dev', displayName: 'Maya Lindqvist' },
    { email: 'alex.kim@collabboard.dev', displayName: 'Alex Kim' },
    { email: 'jordan.diaz@collabboard.dev', displayName: 'Jordan Diaz' },
    { email: 'wei.zhang@collabboard.dev', displayName: 'Wei Zhang' },
    { email: 'olivia.brennan@collabboard.dev', displayName: 'Olivia Brennan' },
  ];

  const userMap = {};
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { displayName: u.displayName, passwordHash },
      create: { email: u.email, displayName: u.displayName, passwordHash },
    });
    userMap[u.email] = user;
  }
  console.log(`Users ensured: ${Object.keys(userMap).length}`);

  const sarah = userMap['sarah.chen@collabboard.dev'];
  const james = userMap['james.okafor@collabboard.dev'];
  const priya = userMap['priya.nair@collabboard.dev'];
  const maya = userMap['maya.lindqvist@collabboard.dev'];
  const alex = userMap['alex.kim@collabboard.dev'];
  const jordan = userMap['jordan.diaz@collabboard.dev'];
  const wei = userMap['wei.zhang@collabboard.dev'];
  const olivia = userMap['olivia.brennan@collabboard.dev'];

  // 2. Team creation or update
  let team = await prisma.team.findFirst({ where: { name: 'Acme Engineering' } });
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: 'Acme Engineering',
        ownerId: sarah.id,
      },
    });
  }
  console.log(`Team created/ensured: id ${team.id} (${team.name})`);

  // 3. Team Memberships
  const memberships = [
    { userId: sarah.id, role: 'owner' },
    { userId: james.id, role: 'admin' },
    { userId: priya.id, role: 'admin' },
    { userId: maya.id, role: 'member' },
    { userId: alex.id, role: 'member' },
    { userId: jordan.id, role: 'member' },
    { userId: wei.id, role: 'member' },
    { userId: olivia.id, role: 'member' },
  ];

  for (const m of memberships) {
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: m.userId,
        },
      },
      update: { role: m.role },
      create: {
        teamId: team.id,
        userId: m.userId,
        role: m.role,
      },
    });
  }
  console.log('Team memberships configured.');

  // 4. Board creation
  let board = await prisma.board.findFirst({ where: { teamId: team.id } });
  if (!board) {
    board = await prisma.board.create({
      data: {
        id: 1,
        teamId: team.id,
        name: 'Sprint 42',
      },
    });
  }
  console.log(`Board ensured: id ${board.id} (${board.name})`);

  // 5. Seed tasks if not already present
  const existingTasks = await prisma.task.findMany({ where: { boardId: board.id } });
  if (existingTasks.length === 0) {
    const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

    const task1 = await prisma.task.create({
      data: {
        boardId: board.id,
        title: 'Create unified icon set for sidebar navigation',
        description: 'Design and export vector icon set adhering to design tokens and role indicators.',
        status: 'todo',
        createdBy: sarah.id,
        assigneeId: maya.id,
        priorityFlag: 1,
        dueDate: daysFromNow(2),
      },
    });

    const task2 = await prisma.task.create({
      data: {
        boardId: board.id,
        title: 'API payload restructure for user settings',
        description: 'Refactor REST payloads and ensure role validation schemas in Zod.',
        status: 'todo',
        createdBy: james.id,
        assigneeId: james.id,
        priorityFlag: 2,
        dueDate: daysFromNow(3),
      },
    });

    const task3 = await prisma.task.create({
      data: {
        boardId: board.id,
        title: 'Competitor analysis on dashboard layouts',
        description: 'Review modern multi-tenant enterprise dashboards and draft architectural comparisons.',
        status: 'todo',
        createdBy: sarah.id,
        assigneeId: alex.id,
        priorityFlag: 0,
        dueDate: daysFromNow(5),
      },
    });

    const task4 = await prisma.task.create({
      data: {
        boardId: board.id,
        title: 'Implement responsive grid for main dashboard view',
        description: 'Build flexible container layouts with role-conditional action menus and mobile support.',
        status: 'in_progress',
        createdBy: james.id,
        assigneeId: maya.id,
        priorityFlag: 2,
        dueDate: daysFromNow(1),
      },
    });

    const task5 = await prisma.task.create({
      data: {
        boardId: board.id,
        title: 'Update typography tokens in shared library',
        description: 'Align CSS custom variables with Google Fonts Outfit & Inter specs.',
        status: 'in_progress',
        createdBy: maya.id,
        assigneeId: maya.id,
        priorityFlag: 1,
        dueDate: daysFromNow(2),
      },
    });

    const task6 = await prisma.task.create({
      data: {
        boardId: board.id,
        title: 'Configure CI/CD pipeline for staging environment',
        description: 'Automate build testing, lint checks, and preview deployments.',
        status: 'done',
        createdBy: james.id,
        assigneeId: james.id,
        priorityFlag: 1,
        dueDate: daysFromNow(-2),
      },
    });

    const task7 = await prisma.task.create({
      data: {
        boardId: board.id,
        title: 'Draft initial wireframes for mobile view',
        description: 'Figma prototypes for bottom sheets and collapsed role navigation.',
        status: 'done',
        createdBy: sarah.id,
        assigneeId: alex.id,
        priorityFlag: 0,
        dueDate: daysFromNow(-3),
      },
    });

    console.log('Tasks created.');

    // 6. Dependencies (Task 4 depends on Task 2; Task 5 depends on Task 1)
    await prisma.taskDependency.createMany({
      data: [
        { taskId: task4.id, dependsOnTaskId: task2.id },
        { taskId: task5.id, dependsOnTaskId: task1.id },
      ],
      skipDuplicates: true,
    });
    console.log('Task dependencies created.');

    // 7. Comments
    await prisma.comment.createMany({
      data: [
        {
          taskId: task4.id,
          authorId: sarah.id,
          body: 'Sarah Chen (Owner): Prioritizing this for our next deployment. Please verify dependencies with the backend schema.',
        },
        {
          taskId: task4.id,
          authorId: maya.id,
          body: 'Maya Lindqvist (Member): Frontend components are structured according to the role spec and ready for testing.',
        },
        {
          taskId: task2.id,
          authorId: james.id,
          body: 'James Okafor (Admin): Auth and role validation middleware are ready for review.',
        },
      ],
    });
    console.log('Comments created.');

    // 8. Activity Logs
    await prisma.activityLog.createMany({
      data: [
        { teamId: team.id, userId: sarah.id, action: 'promoted sprint scope and locked column order', taskId: task1.id },
        { teamId: team.id, userId: james.id, action: 'reassigned task to Maya Lindqvist', taskId: task4.id },
        { teamId: team.id, userId: maya.id, action: 'moved task to In Progress', taskId: task5.id },
      ],
    });
    console.log('Activity logs created.');

    // 9. Notifications
    await prisma.notification.createMany({
      data: [
        { userId: maya.id, message: 'Sarah Chen assigned you to "Implement responsive grid for main dashboard view"', taskId: task4.id, isRead: false },
        { userId: maya.id, message: 'James Okafor mentioned you in "API payload restructure for user settings"', taskId: task2.id, isRead: false },
        { userId: sarah.id, message: 'Maya Lindqvist updated typography tokens in shared library', taskId: task5.id, isRead: true },
      ],
    });
    console.log('Notifications created.');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
