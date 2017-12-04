// list of all the properties binded to Global Scope

global.rootRequire = name =>
  // eslint-disable-next-line
  require(`${__dirname}/${name}`)

global.logger = require('./config/logger');

function newError(name, message, opts) {
  const error = new Error(message);
  error.name = name;
  if (opts) {
    error.opts = opts;
  }
  logger.child(Object.assign({}, {
    name
  }, opts)).error(message)
  return error;
}


global.newError = newError;