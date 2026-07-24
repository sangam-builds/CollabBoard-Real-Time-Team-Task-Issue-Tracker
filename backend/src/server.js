require('dotenv').config();
const http = require('http');
const createApp = require('./app');
const initSockets = require('./sockets');
const logger = require('./utils/logger');

// Register the notification listener once at startup -- side-effecting require.
require('./events/listeners/notification.listener');

const PORT = process.env.PORT || 4000;

const app = createApp();
const httpServer = http.createServer(app);
const io = initSockets(httpServer);
app.set('io', io);

httpServer.listen(PORT, () => {
  logger.info(`CollabBoard API listening on port ${PORT}`);
});
