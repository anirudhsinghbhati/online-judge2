const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');

// Configuration options with defaults
const windowMs = Number(process.env.SUBMISSION_RATE_LIMIT_WINDOW_MS || 60000); // 1 minute
const max = Number(process.env.SUBMISSION_RATE_LIMIT_MAX || 5); // Limit to 5 requests per windowMs
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Setup Redis Client (forcing RESP2 protocol for compatibility with older Redis servers)
const redisClient = createClient({
  url: redisUrl,
  RESP: 2
});

redisClient.on('error', (err) => {
  console.warn('Redis client error:', err.message);
  fallbackStore.useRedis = false;
});

redisClient.on('connect', () => {
  console.log('Redis connected for rate-limiting store');
  fallbackStore.useRedis = true;
});

redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...');
  fallbackStore.useRedis = false;
});

redisClient.on('end', () => {
  console.log('Redis connection closed');
  fallbackStore.useRedis = false;
});

// Initialize client asynchronously
redisClient.connect().catch((err) => {
  console.warn('Failed to connect to Redis. Rate limiter will use in-memory fallback.', err.message);
  fallbackStore.useRedis = false;
});

// Create RedisStore instance
const redisStore = new RedisStore({
  sendCommand: (...args) => redisClient.sendCommand(args),
});

// Create default MemoryStore instance
const memoryStore = new rateLimit.MemoryStore();

// Custom fallback store wrapper to handle Redis connection dropouts
class FallbackStore {
  constructor(redisStore, memoryStore) {
    this.redisStore = redisStore;
    this.memoryStore = memoryStore;
    this.useRedis = false;
  }

  init(options) {
    if (this.redisStore && typeof this.redisStore.init === 'function') {
      this.redisStore.init(options);
    }
    if (this.memoryStore && typeof this.memoryStore.init === 'function') {
      this.memoryStore.init(options);
    }
  }

  async increment(key) {
    if (this.useRedis) {
      try {
        return await this.redisStore.increment(key);
      } catch (err) {
        console.warn('Redis rate-limiter increment failed, falling back to MemoryStore:', err.message);
        this.useRedis = false;
      }
    }
    return this.memoryStore.increment(key);
  }

  async decrement(key) {
    if (this.useRedis) {
      try {
        return await this.redisStore.decrement(key);
      } catch (err) {
        console.warn('Redis rate-limiter decrement failed, falling back to MemoryStore:', err.message);
        this.useRedis = false;
      }
    }
    return this.memoryStore.decrement(key);
  }

  async resetKey(key) {
    if (this.useRedis) {
      try {
        return await this.redisStore.resetKey(key);
      } catch (err) {
        console.warn('Redis rate-limiter resetKey failed, falling back to MemoryStore:', err.message);
        this.useRedis = false;
      }
    }
    return this.memoryStore.resetKey(key);
  }
}

const fallbackStore = new FallbackStore(redisStore, memoryStore);

// Create the rate limiting middleware
const submissionLimiter = rateLimit({
  windowMs,
  max,
  store: fallbackStore,
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable legacy X-RateLimit-* headers
  // Disable ERL validation warnings
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    keyGeneratorIpFallback: false
  },
  keyGenerator: (req) => {
    // Rate limit by User ID if present in req body, fallback to IP address
    if (req.body && req.body.userId) {
      return `user_${req.body.userId}`;
    }
    return req.ip;
  },
  handler: (req, res, next, options) => {
    res.status(429).json({
      success: false,
      message: `Too many submissions. Please wait ${Math.ceil(windowMs / 1000)} seconds before running or submitting code again.`
    });
  }
});

module.exports = {
  submissionLimiter,
  redisClient // exported in case of cleanup/testing
};
