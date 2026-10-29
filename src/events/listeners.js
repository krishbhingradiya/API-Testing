const taskEvents = require('./events');

/**
 * Task Event Listeners Module
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 * 
 * NOTE ON ASYNCHRONOUS BEHAVIOR:
 * Node.js's native EventEmitter invokes all registered listener functions synchronously
 * in the order they were registered. In this architecture, true non-blocking asynchronous
 * execution is achieved by scheduling slow background operations (e.g. notifications)
 * via setTimeout onto the libuv event loop timer queue, allowing the HTTP route handler
 * to return immediately to the client without delay.
 */

// 1. Error Event Listener
// Handled explicitly during startup to prevent unhandled 'error' events from crashing the process
taskEvents.on('error', (error) => {
  console.error('[Event Error]', error.message || error);
});

// 2. "task-created" Event Listener
// Receives the created task document and simulates slow asynchronous notification work
taskEvents.on('task-created', (task) => {
  const handlerStartTime = new Date().toISOString();
  console.log(`[Listener] task-created handler started at ${handlerStartTime}`);

  // Simulate slow asynchronous processing (e.g., email notification, push notification)
  // using setTimeout with 2000ms delay. Does NOT block the Node.js event loop.
  setTimeout(() => {
    try {
      const completionTime = new Date().toISOString();
      const taskTitle = task?.title || 'Untitled';
      const assignedUser = task?.assignedUser || task?.assignedTo || 'Unassigned';

      console.log(`[Notification] Task "${taskTitle}" created at ${completionTime}`);
      console.log(`[Notification] Assigned user: ${assignedUser}`);
      console.log(`[Listener] Notification processing completed at ${completionTime}`);
    } catch (error) {
      // Forward listener exception to the EventEmitter error handler
      taskEvents.emit('error', error);
    }
  }, 2000);
});

// 3. "task-deleted" Event Listener
// Receives the deleted task document and logs distinct deletion notification
taskEvents.on('task-deleted', (task) => {
  try {
    const timestamp = new Date().toISOString();
    const taskTitle = task?.title || 'Untitled';
    console.log(`[Deletion Listener] Task "${taskTitle}" was deleted at ${timestamp}`);
  } catch (error) {
    taskEvents.emit('error', error);
  }
});

module.exports = taskEvents;
