// Starting an API Server to expose functinalities

const express = require('../config/express')

const port = process.env.PORT;
const app = express();
const server = require('http').Server(app);

// mounting middlewares
require('./middleware/basic')(app);
app.use(require('./middleware/requestLogger'));

// whitelisting only for production
if (process.env.NODE_ENV === 'production') {
  app.use(require('./middleware/ipAuthentication'));
}
// mounting routes
const router = require('./router/routes')();

app.use(`/trading-api/${process.env.NODE_ENV}`, router);

require('./middleware/handleError')(app);

server.listen(port, (err) => {
  if (err) {
    logger.error(`Failure to listen: ${err.message} | ${err.name}`)
  }
  logger.info(`Live @PORT: ${port}@ENV: ${process.env.NODE_ENV}`);
});

module.exports = {
  app,
  server,
};