// Prisma seed script -- populates enough realistic data to actually exercise
// every feature: RBAC (3 roles), a task dependency graph (for the
// prioritization algorithm), comments, activity logs, and notifications.
//
// Safe to re-run: it wipes existing seed data first (in FK-safe order) so you
// don't get duplicate rows every time you run `npx prisma db seed`.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SEED_PASSWORD = 'Password123!'; // same password for every seeded user, for easy local testing

async function main() {
  console.log('Clearing existing data...');
  // Delete in reverse-dependency order so foreign keys don't block the wipe.
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.board.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const [sangam, aisha, rahul, priya] = await Promise.all(
    [
      { email: 'sangam@collabboard.dev', displayName: 'Sangam Gupta' },
      { email: 'aisha@collabboard.dev', displayName: 'Aisha Khan' },
      { email: 'rahul@collabboard.dev', displayName: 'Rahul Mehta' },
      { email: 'priya@collabboard.dev', displayName: 'Priya Nair' },
    ].map((u) => prisma.user.create({ data: { ...u, passwordHash } }))
  );

  console.log('Creating team + memberships...');
  const team = await prisma.team.create({
    data: { name: 'Engineering', ownerId: sangam.id },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: team.id, userId: sangam.id, role: 'owner' },
      { teamId: team.id, userId: aisha.id, role: 'admin' },
      { teamId: team.id, userId: rahul.id, role: 'member' },
      { teamId: team.id, userId: priya.id, role: 'member' },
    ],
  });

  console.log('Creating board...');
  const board = await prisma.board.create({
    data: { teamId: team.id, name: 'Sprint 12' },
  });

  console.log('Creating tasks...');
  const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

  const setupDb = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Set up Supabase project and Prisma schema',
      description: 'Provision the Supabase Postgres instance and apply the initial Prisma migration.',
      status: 'done',
      createdBy: sangam.id,
      assigneeId: sangam.id,
      priorityFlag: 1,
      dueDate: daysFromNow(-2),
    },
  });

  const authApi = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Build JWT auth endpoints',
      description: 'Register/login routes, bcrypt password hashing, JWT issuing and verification middleware.',
      status: 'done',
      createdBy: sangam.id,
      assigneeId: aisha.id,
      priorityFlag: 1,
      dueDate: daysFromNow(-1),
    },
  });

  const taskCrud = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Implement task CRUD + RBAC middleware',
      description: 'Create/list/assign/update-status endpoints with per-team role checks.',
      status: 'in_progress',
      createdBy: sangam.id,
      assigneeId: rahul.id,
      priorityFlag: 2,
      dueDate: daysFromNow(2),
    },
  });

  const realtimeSync = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Wire up Socket.io real-time board updates',
      description: 'Broadcast task:created / task:updated events to everyone viewing a board.',
      status: 'in_progress',
      createdBy: aisha.id,
      assigneeId: priya.id,
      priorityFlag: 1,
      dueDate: daysFromNow(3),
    },
  });

  const prioritizationAlgo = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Implement dependency-aware prioritization algorithm',
      description: 'Topological sort (Kahn\'s algorithm) over task_dependencies, scored by urgency + dependents.',
      status: 'todo',
      createdBy: sangam.id,
      assigneeId: sangam.id,
      priorityFlag: 2,
      dueDate: daysFromNow(5),
    },
  });

  const searchFeature = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Add full-text search on tasks',
      description: 'Postgres tsvector + GIN index, ranked results via ts_rank.',
      status: 'todo',
      createdBy: aisha.id,
      assigneeId: rahul.id,
      priorityFlag: 0,
      dueDate: daysFromNow(7),
    },
  });

  const analyticsDashboard = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Build analytics dashboard',
      description: 'Task velocity + activity-by-member charts using Recharts, sourced from activity_logs.',
      status: 'todo',
      createdBy: sangam.id,
      assigneeId: priya.id,
      priorityFlag: 0,
      dueDate: daysFromNow(10),
    },
  });

  const loadTesting = await prisma.task.create({
    data: {
      boardId: board.id,
      title: 'Load test for 500 concurrent users',
      description: 'k6 script ramping to 500 virtual users, measure p95 latency and error rate.',
      status: 'todo',
      createdBy: sangam.id,
      assigneeId: null, // unassigned on purpose, to test that flow too
      priorityFlag: 0,
      dueDate: daysFromNow(12),
    },
  });

  console.log('Creating task dependency graph...');
  // Small, realistic chain + branch -- exercises the topological sort without being a cycle:
  //   setupDb -> authApi -> taskCrud -> realtimeSync -> prioritizationAlgo
  //                                   -> searchFeature
  //   analyticsDashboard depends on realtimeSync (needs activity data flowing first)
  //   loadTesting depends on taskCrud + realtimeSync (needs the API + sockets built first)
  await prisma.taskDependency.createMany({
    data: [
      { taskId: authApi.id, dependsOnTaskId: setupDb.id },
      { taskId: taskCrud.id, dependsOnTaskId: authApi.id },
      { taskId: realtimeSync.id, dependsOnTaskId: taskCrud.id },
      { taskId: prioritizationAlgo.id, dependsOnTaskId: realtimeSync.id },
      { taskId: searchFeature.id, dependsOnTaskId: realtimeSync.id },
      { taskId: analyticsDashboard.id, dependsOnTaskId: realtimeSync.id },
      { taskId: loadTesting.id, dependsOnTaskId: taskCrud.id },
      { taskId: loadTesting.id, dependsOnTaskId: realtimeSync.id },
    ],
  });

  console.log('Creating comments...');
  await prisma.comment.createMany({
    data: [
      { taskId: taskCrud.id, authorId: rahul.id, body: 'Started on the controller layer, RBAC middleware next.' },
      { taskId: taskCrud.id, authorId: sangam.id, body: 'Make sure the permission check lives in the service layer, not the route.' },
      { taskId: realtimeSync.id, authorId: priya.id, body: 'Socket auth handshake is working locally, testing reconnect behavior now.' },
      { taskId: searchFeature.id, authorId: aisha.id, body: 'Do we need the trigger to fire on description edits too, or just title?' },
    ],
  });

  console.log('Creating activity logs...');
  await prisma.activityLog.createMany({
    data: [
      { teamId: team.id, userId: sangam.id, action: 'task_created', taskId: setupDb.id },
      { teamId: team.id, userId: sangam.id, action: 'task_completed', taskId: setupDb.id },
      { teamId: team.id, userId: aisha.id, action: 'task_completed', taskId: authApi.id },
      { teamId: team.id, userId: sangam.id, action: 'task_assigned', taskId: taskCrud.id },
      { teamId: team.id, userId: aisha.id, action: 'task_assigned', taskId: realtimeSync.id },
      { teamId: team.id, userId: rahul.id, action: 'comment_added', taskId: taskCrud.id },
      { teamId: team.id, userId: priya.id, action: 'comment_added', taskId: realtimeSync.id },
    ],
  });

  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: rahul.id, message: `You were assigned: ${taskCrud.title}`, taskId: taskCrud.id, isRead: true },
      { userId: priya.id, message: `You were assigned: ${realtimeSync.title}`, taskId: realtimeSync.id, isRead: false },
      { userId: rahul.id, message: `You were assigned: ${searchFeature.title}`, taskId: searchFeature.id, isRead: false },
    ],
  });

  console.log('\nSeed complete.');
  console.log('Login with any of these (all share the same password):');
  console.log('  sangam@collabboard.dev / aisha@collabboard.dev / rahul@collabboard.dev / priya@collabboard.dev');
  console.log(`  password: ${SEED_PASSWORD}`);
  console.log(`\nBoard ID to open in the frontend: ${board.id}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
