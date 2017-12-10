const redis = require('redis');

const client = redis.createClient(process.env.REDIS_UNIX_SOCKET, {
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
});

client.on('connect', () => {
  logger.info('Redis connected.');
});
client.on('ready', () => {
  logger.info('Redis connection estsblished.'); // Set a value with an expiration
  // client.set('string key', 'Hello World');
  // // Expire in 3 seconds
  // client.expire('string key', 3);

  // const myTimer = setInterval(() => {
  //   client.get('string key', (err, reply) => {
  //     if (reply) {
  //       console.log(reply);
  //     } else {
  //       clearTimeout(myTimer);
  //       console.log('I expired');
  //       client.quit();
  //     }
  //   });
  // }, 1000);
});
client.on('error', (err) => {
  logger.error(`Redis Error ${err.message}`);
});
client.on('reconnecting', () => {
  logger.info('Redis client reconnecting to redis server');
});
client.on('end', () => {
  logger.info('Redis disconnected');
});

module.exports = {
  client,
};