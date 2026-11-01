const NodeCache = require('node-cache');

/**
 * Shared NodeCache instance for Practical 9 (In-Memory Caching)
 * stdTTL: 60 seconds (data expires after 1 minute of inactivity)
 * checkperiod: 120 seconds (automatic cleanup of expired keys)
 */
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120
});

// Runtime debugging counters (not persisted to DB)
let hits = 0;
let misses = 0;

/**
 * Record a cache hit event
 */
cache.recordHit = function () {
  hits++;
};

/**
 * Record a cache miss event
 */
cache.recordMiss = function () {
  misses++;
};

/**
 * Get runtime cache statistics
 */
cache.getCustomStats = function () {
  const totalRequests = hits + misses;
  const hitRate = totalRequests > 0 ? `${((hits / totalRequests) * 100).toFixed(2)}%` : '0.00%';
  return {
    hits,
    misses,
    totalRequests,
    hitRate,
    activeKeys: cache.keys(),
    ttlSeconds: 60
  };
};

/**
 * Reset runtime cache statistics (useful for isolated test runs)
 */
cache.resetCustomStats = function () {
  hits = 0;
  misses = 0;
};

module.exports = cache;
