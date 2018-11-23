const { RATE_LIMIT_WINDOW_IN_SECONDS } = require('../config')

const RedisLib = require('./redis.lib')

const { ErrorsUtil, RequestManagerUtil, ResponseManagerUtil } = require('../util')
const { RateLimitExceededError, RateLimiterCacheError } = ErrorsUtil

class RateLimiterLib {
  /**
   * @constructor
   * @description Set RATE_LIMIT_WINDOW_IN_SECONDS to default value.
   */
  constructor () {
    this.RATE_LIMIT_WINDOW_IN_SECONDS = RATE_LIMIT_WINDOW_IN_SECONDS
  }

  /**
   * @param {Object} payload
   * @param {Object} payload.client
   * @param {string} payload.serverName
   * @description Set cache client and server name.
   */
  init (payload) {
    const { client, serverName } = payload
    RedisLib.setClient(client)
    RedisLib.setServerName(serverName)
  }

  /**
   * @param {number} payload
   * @param {number} payload.maxNumberOfRequests
   * @param {number} [payload.rateLimitWindowInSeconds]
   * @returns {Function} middleware
   * @description Check whether requests rate limit is reached for current request method, path and client IP.
   */
  preventRateLimitAbuse (payload) {
    const { maxNumberOfRequests, rateLimitWindowInSeconds } = payload

    RedisLib.validateRedisClient()
    RedisLib.validateServerName()

    const timeWindow = rateLimitWindowInSeconds || this.RATE_LIMIT_WINDOW_IN_SECONDS

    return async (request, response, next) => {
      const timeWindowCount = Math.floor(Date.now() / (timeWindow * 1000))
      const resetTime = (timeWindowCount + 1) * timeWindow * 1000

      const keyGenerationPayload = RateLimiterLib.generateKeyPayload(request, timeWindowCount)
      const key = RateLimiterLib.generateKey(keyGenerationPayload)

      try {
        const decrementedLimit = await RateLimiterLib.decrementLimit(key)
        const requestsCount = Math.abs(decrementedLimit)

        const remainingLimit = maxNumberOfRequests - requestsCount
        const remainingLimitToSetOnHeaders = remainingLimit < 0 ? 0 : remainingLimit

        const rateLimitData = {
          limit: maxNumberOfRequests,
          remaining: remainingLimitToSetOnHeaders,
          reset: resetTime
        }

        ResponseManagerUtil.setRateLimitHeaders(response, rateLimitData)

        if (remainingLimit < 0) {
          const requestFullPath = RequestManagerUtil.getRequestFullPath(request)
          const requestMethod = request.method

          throw new RateLimitExceededError(`Exceeded rate limit for ${requestMethod} ${requestFullPath} endpoint.`)
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  }

  /**
   * @param {string} key
   * @description Decrement limit.
   */
  static async decrementLimit (key) {
    try {
      const decrementedValue = await RedisLib.decrementRedisKeyValue(key)

      return decrementedValue
    } catch (error) {
      throw new RateLimiterCacheError(error.message)
    }
  }

  /**
   * @param {Object} request
   * @param {number} timeWindowCount
   * @description Generate key payload.
   */
  static generateKeyPayload (request, timeWindowCount) {
    return {
      ip: RequestManagerUtil.getRequestIp(request),
      method: request.method,
      path: RequestManagerUtil.getRequestFullPath(request),
      timeWindowCount
    }
  }

  /**
   * @param {Object} payload
   * @param {string} payload.ip
   * @param {string} payload.method
   * @param {string} payload.path
   * @param {number} payload.timeWindowCount
   * @returns {string} - generated key
   * @description Generate key for redis.
   */
  static generateKey (payload) {
    const { ip, method, path, timeWindowCount } = payload

    return `RateLimiter:${ip}:${method}:${path}:${timeWindowCount}`
  }
}

module.exports = new RateLimiterLib()

module.exports.test = RateLimiterLib
