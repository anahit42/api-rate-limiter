class ResponseManagerUtil {
  /**
   * @param {Object} response
   * @param {Object} data
   * @param {number} data.limit
   * @param {number} data.remaining
   * @param {number} data.reset
   * @description Set limit headers on response object.
   */
  static setRateLimitHeaders (response, data) {
    const { limit, remaining, reset } = data

    response.set('X-RateLimit-Limit', limit)
    response.set('X-RateLimit-Remaining', remaining)
    response.set('X-RateLimit-Reset', reset)
  }
}

module.exports = ResponseManagerUtil
