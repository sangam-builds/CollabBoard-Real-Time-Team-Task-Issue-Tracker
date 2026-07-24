const { EventEmitter } = require('events');

// In-process event bus replacing the earlier Redis+BullMQ queue.
// Keeps notification logic decoupled from request handling logic --
// services emit events, listeners react -- without needing separate infra.
// Tradeoff (documented, not hidden): if a listener throws, there's no automatic
// retry like BullMQ gave us. Listeners are responsible for their own error handling.
class EventBus extends EventEmitter {}

const eventBus = new EventBus();

// EventEmitter swallows listener errors by default in some cases -- make failures visible.
eventBus.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('EventBus error:', err);
});

module.exports = eventBus;
