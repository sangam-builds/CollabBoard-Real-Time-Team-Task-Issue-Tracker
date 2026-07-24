const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Single-instance Socket.io -- no Redis adapter needed at this scale.
// A single Node.js process comfortably handles ~500 concurrent WebSocket
// connections; this only becomes a bottleneck in the thousands+ range or if
// you need multiple server instances, at which point a Redis (or similar)
function initSockets(httpServer) {
  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? (process.env.CLIENT_ORIGIN.includes(',')
        ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
        : process.env.CLIENT_ORIGIN)
    : true;

  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    // Tuned slightly for a moderate number of concurrent clients:
    // shorter ping interval catches dead connections faster so they don't
    // linger and hold resources under load.
    pingInterval: 20000,
    pingTimeout: 20000,
  });

  // Auth handshake: reject unauthenticated socket connections up front,
  // same JWT used for the REST API.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.userId, email: payload.email };
      next();
    } catch (err) {
      next(new Error('Invalid auth token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('board:join', (boardId) => {
      socket.join(`board:${boardId}`);
    });

    socket.on('board:leave', (boardId) => {
      socket.leave(`board:${boardId}`);
    });
  });

  return io;
}

module.exports = initSockets;
