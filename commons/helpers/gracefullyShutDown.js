const mongoose = require('mongoose');

// Gracefull shutdown, preventing data loss.
// i.e. wait for existing connections and processes
module.exports = (appServer) => {
  const gracefulShutdown = (err) => {
    if (err) {
      logger.info(`uncaughtException: ${err.message}`);
      logger.child({ trace: err.stack }).error('stacktrace');
    } else {
      logger.warn('Received kill signal, shutting down gracefully.');
    }
    mongoose.connection.close(() => {
      logger.info('Mongoose default connection disconnected through app termination');
    });
    appServer.close((e) => {
      if (e) {
        logger.info('Shutting Down Forcefully');
        process.exit(1);
      } else {
        logger.info('Shutting Down');
        process.exit(0);
      }
    })
  }

  // listen for TERM signal .e.g. kill
  process.on('SIGTERM', gracefulShutdown)

  // listen for INT signal e.g. Ctrl-C
  process.on('SIGINT', gracefulShutdown)

  // uncaughtException Exception
  process.on('uncaughtException', gracefulShutdown)
}