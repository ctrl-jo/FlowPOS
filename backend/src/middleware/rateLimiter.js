const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../utils/redis');

/**
 * Auth rate limiter: 5 requests per 15 minutes per IP.
 * Uses Redis as the backing store for distributed rate limiting.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

module.exports = { authLimiter };
