const ERROR_NAMES = [
  'RateLimitExceededError',
  'RateLimiterCacheError',
  'RateLimiterInvalidRedisClientError',
  'RateLimiterInvalidServerNameError',
  'RateLimiterMissingRedisClientError',
  'RateLimiterMissingServerNameError'
]

const ERRORS = ERROR_NAMES.reduce((acc, className) => {
  acc[className] = ({
    [className]: class extends Error {
      constructor (msg) {
        super()
        this.message = msg
        this.name = this.constructor.name
      }
    }
  })[className]

  return acc
}, {})

module.exports = ERRORS
