const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = createClient({
  url: redisUrl,
  RESP: 2
});

let isConnected = false;

client.on('error', (err) => {
  console.warn('Cache Redis Client Error:', err.message);
  isConnected = false;
});

client.on('connect', () => {
  console.log('Cache Redis connected successfully');
  isConnected = true;
});

client.on('end', () => {
  console.log('Cache Redis connection closed');
  isConnected = false;
});

// Initialize connection asynchronously
client.connect().catch((err) => {
  console.warn('Failed to connect to Cache Redis. Caching will be disabled/bypassed.', err.message);
  isConnected = false;
});

/**
 * Get cached data by key
 * @param {string} key 
 * @returns {Promise<any|null>} Parsed JSON or null
 */
async function get(key) {
  if (!isConnected) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`Redis GET failed for key: ${key}`, err.message);
    return null;
  }
}

/**
 * Set cached data with a TTL (Time-To-Live)
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl Time to live in seconds (default 300)
 */
async function set(key, value, ttl = 300) {
  if (!isConnected) return;
  try {
    const dataStr = JSON.stringify(value);
    await client.set(key, dataStr, {
      EX: ttl
    });
  } catch (err) {
    console.warn(`Redis SET failed for key: ${key}`, err.message);
  }
}

/**
 * Delete a cache key
 * @param {string} key 
 */
async function del(key) {
  if (!isConnected) return;
  try {
    await client.del(key);
  } catch (err) {
    console.warn(`Redis DEL failed for key: ${key}`, err.message);
  }
}

/**
 * Delete all cache keys matching a pattern
 * @param {string} pattern E.g. 'problems:*'
 */
async function delPattern(pattern) {
  if (!isConnected) return;
  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    console.warn(`Redis delPattern failed for pattern: ${pattern}`, err.message);
  }
}

/**
 * Fetch from cache, or invoke callback to fetch from DB and store in cache
 * @param {string} key 
 * @param {number} ttl Time to live in seconds
 * @param {Function} fetchFn Async function returning fresh data
 */
async function cacheOrFetch(key, ttl, fetchFn) {
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }
  const fresh = await fetchFn();
  if (fresh !== null && fresh !== undefined) {
    await set(key, fresh, ttl);
  }
  return fresh;
}

module.exports = {
  get,
  set,
  del,
  delPattern,
  cacheOrFetch,
  client
};
