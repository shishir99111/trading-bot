const bodyParser = require('body-parser');
const morgan = require('morgan');

function basicMiddlewares(app) {
  // throws 400 error to next, if JSON is not valid
  app.use(bodyParser.json({
    strict: true,
  }));

  // parses the url encoded strings
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  // logs incoming request in dev pattern
  // app.use(morgan('dev'));
  app.use(morgan('dev', { stream: logger.stream }))
}

module.exports = basicMiddlewares;