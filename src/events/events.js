const EventEmitter = require('events');

/**
 * TaskEvents — Dedicated shared EventEmitter instance for Task-related domain events
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 */
class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
