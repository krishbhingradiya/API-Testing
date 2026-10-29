const express = require('express');
const router = express.Router();
const cache = require('../utils/cache');
const taskEvents = require('../events/events');

/**
 * @route   GET /debug/cache
 * @desc    Get runtime cache performance statistics (HIT/MISS counts, hit rate, active keys)
 * @status  200 OK
 */
router.get('/cache', (req, res) => {
  const stats = cache.getCustomStats();
  res.status(200).json({
    success: true,
    ...stats
  });
});

/**
 * @route   POST /debug/event-error
 * @desc    Practical 10: Emit an error event on taskEvents to verify error handling without crashing
 * @status  200 OK
 */
router.post('/event-error', (req, res) => {
  const errorMessage = (req.body && req.body.message) || 'Intentional test error for Practical 10 EventEmitter';
  taskEvents.emit('error', new Error(errorMessage));
  res.status(200).json({
    success: true,
    message: 'Error event emitted and handled safely by taskEvents error listener',
    emittedError: errorMessage
  });
});

module.exports = router;
