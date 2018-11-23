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
