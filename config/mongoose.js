const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const env = process.env;
env.connectionString = `mongodb://${env.DB_URI}/${env.DB}`;
let db = {};

function init(cb) {
  const options = {
    useMongoClient: true,
  };

  if (env.NODE_ENV === 'development') {
    db = mongoose.connect(env.connectionString, options);
  } else {
    // disabled in production since index creation can cause a significant performance impact
    // eslint-disable-next-line
    db = mongoose.connect(env.connectionString, Object.assign({}, {
      config: {
        autoIndex: false,
      },
    }, options));
  }
  autoIncrement.initialize(db);
  logger.debug(`Connection url: ${env.connectionString}`);

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', () => {
    logger.info(`Connected ${env.DB_URI}/${env.DB}`);
    cb();
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose default connection error: ${err}`);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose default connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.info('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });

  // LOADING MODELS
  require('../commons/models');
}


module.exports = {
  init,
};