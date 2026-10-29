/**
 * AI Rate Limiter Middleware
 * Practical 13: Enforces 1 request per task context / title per minute (60s cooldown).
 * Protects against API quota exhaustion, excessive costs, and request spam.
 */

const requestLog = new Map();
const COOLDOWN_MS = 60 * 1000; // 60 seconds

function aiRateLimiter(req, res, next) {
  const title = (req.body && req.body.title ? String(req.body.title).trim().toLowerCase() : '');
  const clientIp = req.ip || req.connection.remoteAddress || 'anonymous';
  
  // Track context per combination of client IP and normalized task title
  const contextKey = `${clientIp}::${title || '__general__'}`;
  const now = Date.now();
  const lastRequestTime = requestLog.get(contextKey);

  if (lastRequestTime && (now - lastRequestTime) < COOLDOWN_MS) {
    const remainingMs = COOLDOWN_MS - (now - lastRequestTime);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    res.set('Retry-After', String(remainingSeconds));
    return res.status(429).json({
      success: false,
      rateLimited: true,
      retryAfter: remainingSeconds,
      message: `Rate limit: Please wait ${remainingSeconds}s before regenerating a description for the same title.`
    });
  }

  // Record this request timestamp
  requestLog.set(contextKey, now);

  // Periodically cleanup entries older than 5 minutes to prevent memory leaks
  if (requestLog.size > 500) {
    const expirationThreshold = now - (5 * 60 * 1000);
    for (const [key, timestamp] of requestLog.entries()) {
      if (timestamp < expirationThreshold) {
        requestLog.delete(key);
      }
    }
  }

  next();
}

/**
 * Reset helper for testing environments
 */
aiRateLimiter.reset = function () {
  requestLog.clear();
};

module.exports = aiRateLimiter;
