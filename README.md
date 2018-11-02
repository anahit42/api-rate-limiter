# api-rate-limiter
Rate limiter package for Express server API requests

# API ✍

## api-rate-limiter API

### init(...)

|  Parameter                | Description                              | Required |  Default |
|---------------------------|------------------------------------------|----------|----------|
| payload.client            | RedisClient instance (promisified)       | ✔        | ✘        |
| payload.serverName        | API server name                          | ✔        | ✘        |

Sample: 

  ``` javascript
     const RateLimiter = require('api-rate-limiter')
     
     const Promise = require('bluebird')
     const redis = require('redis')
     
     Promise.promisifyAll(redis.RedisClient.prototype)
     const redisClient = redis.createClient()
     
     RateLimiter.init({ client: redisClient, serverName: 'code-mentor-api' })
  ```

RateLimiter should be initialized before initializing API routes.

##### Errors

|  Error name                         | Description                                                          |
|-------------------------------------|----------------------------------------------------------------------|
| RateLimiterInvalidRedisClientError  | Error thrown in case of invalid redis client                         |
| RateLimiterInvalidServerNameError   | Error thrown in case of invalid server name parameter                |

### preventRateLimitAbuse(...)

|  Parameter                             | Description                                | Required |  Default    |
|----------------------------------------|--------------------------------------------|----------|-------------|
| payload.maxNumberOfRequests            | Maximum allowed requests per time window   | ✔        | ✘           |
| payload.rateLimitWindowInSeconds       | Rate limit time window in seconds          | ✘        | 300 seconds |


Sample: 

  ``` javascript
  
    const express = require('express')
    const router = express.Router()
  
    const RateLimiter = require('api-rate-limiter')
  
    router.get('/',
      RateLimiter.preventRateLimitAbuse({ maxNumberOfRequests: 50,  rateLimitWindowInSeconds: 600 }),
      function (req, res, next) {
          ...request handler code
      })
  ```

##### Errors

|  Error name                         | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| RateLimitExceededError              | Error passed to the next() middleware function in case of rate limit abuse  |
| RateLimiterMissingRedisClientError  | Error thrown in case of missing redis client for rate limiter               |
| RateLimiterMissingServerNameError   | Error thrown in case of missing server name for rate limiter                |


### HTTP Headers

|  Header                | Description                                                 |
|------------------------|-------------------------------------------------------------|
| X-RateLimit-Limit      | Requests permitted to make per time window                  |
| X-RateLimit-Remaining  | Requests remaining in the current time window               |
| X-RateLimit-Reset      | UNIX timestamp detailing when the rate limit will reset     |


Sample: 

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1541169284467
```
