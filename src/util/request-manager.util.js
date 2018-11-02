const requestIp = require('request-ip')

class RequestManagerUtil {
  /**
   * @param {Object} request
   * @returns {string}
   * @description Get request full path.
   */
  static getRequestFullPath (request) {
    const { baseUrl, path } = request

    return `${baseUrl}${path}`
  }

  /**
   * @public
   * @param {Object} request
   * @returns {string}
   * @description Get request IP.
   */
  static getRequestIp (request) {
    return requestIp.getClientIp(request)
  }
}

module.exports = RequestManagerUtil
