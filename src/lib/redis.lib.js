const { ErrorsUtil } = require('../util')
const {
  RateLimiterInvalidRedisClientError, RateLimiterInvalidServerNameError,
  RateLimiterMissingRedisClientError, RateLimiterMissingServerNameError
} = ErrorsUtil

class RedisLib {
  /**
   * @constructor
   */
  constructor () {
    this.client = null
    this.serverName = null
  }

  /**
   * @param {Object} client
   * @description Set redis client.
   */
  setClient (client) {
    if (!client || client.constructor.name !== 'RedisClient') {
      throw new RateLimiterInvalidRedisClientError('Invalid redis client.')
    }
    this.client = client
  }

  /**
   * @description Validate Redis client.
   */
  validateRedisClient () {
    if (this.client === null) {
      throw new RateLimiterMissingRedisClientError('Missing redis client.')
    }
  }

  /**
   * @param {string} serverName
   * @description Set API server name.
   */
  setServerName (serverName) {
    if (!serverName || typeof serverName !== 'string') {
      throw new RateLimiterInvalidServerNameError('Invalid API server name - server name must be a string.')
    }
    this.serverName = serverName
  }

  /**
   * @description Validate server name.
   */
  validateServerName () {
    if (this.serverName === null) {
      throw new RateLimiterMissingServerNameError('Missing server name.')
    }
  }

  /**
   * @param {string} key
   * @param {number} data
   * @param {number} expireTimeInSeconds
   * @returns {Promise.<string>} - resolves status of set operation
   * @description Set data in redis.
   */
  async setInRedis (key, data, expireTimeInSeconds) {
    const cacheKey = `${this.serverName}:${key}`
    const setResult = await this.client.setAsync(cacheKey, data, 'EX', expireTimeInSeconds)

    return setResult
  }

  /**
   * @param {string} key
   * @returns {Promise.<string>} - resolves data found by key
   * @description Get key value from redis.
   */
  async getFromRedis (key) {
    const cacheKey = `${this.serverName}:${key}`
    const value = await this.client.getAsync(cacheKey)

    return value
  }

  /**
   * @param {string} key
   * @returns {Promise.<number>} - resolves decremented key value
   * @description Decrement key value.
   */
  async decrementRedisKeyValue (key) {
    const cacheKey = `${this.serverName}:${key}`
    const value = await this.client.decrAsync(cacheKey)

    return value
  }
}

module.exports = new RedisLib()

module.exports.test = RedisLib
