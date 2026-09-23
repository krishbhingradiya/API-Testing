const express = require('express');
const router = express.Router();
const cache = require('../utils/cache');

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

module.exports = router;
