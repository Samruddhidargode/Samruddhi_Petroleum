function getClientKey(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function createRateLimiter(options = {}) {
  const windowMs = Number(options.windowMs || 15 * 60 * 1000);
  const max = Number(options.max || 300);
  const message = options.message || "Too many requests, please try again later.";

  const buckets = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.expiresAt <= now) {
        buckets.delete(key);
      }
    }
  }, Math.max(60_000, Math.floor(windowMs / 2))).unref();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = getClientKey(req);
    const existing = buckets.get(key);

    if (!existing || existing.expiresAt <= now) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (existing.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ message });
    }

    existing.count += 1;
    return next();
  };
}

module.exports = { createRateLimiter };
