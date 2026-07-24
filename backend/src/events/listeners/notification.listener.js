const eventBus = require('../eventBus');
const prisma = require('../../config/db');
const logger = require('../../utils/logger');

// Registered once at server startup (see server.js).
// Runs asynchronously off the main request path -- the controller that
// emitted 'task:assigned' already returned its HTTP response before this runs.
eventBus.on('task:assigned', async ({ taskId, assigneeId, taskTitle }) => {
  try {
    await prisma.notification.create({
      data: { userId: assigneeId, message: `You were assigned: ${taskTitle}`, taskId },
    });
    // Optional: call an email provider here (e.g. Resend/SendGrid).
    // Kept out of the base scaffold to avoid requiring API keys just to run the project.
  } catch (err) {
    // No automatic retry (that was BullMQ's job) -- log loudly so it's not silently dropped.
    logger.error('Failed to write notification', { err: err.message, taskId, assigneeId });
  }
});

module.exports = eventBus;
