require('dotenv-minimal');
require('./globals');
require('./config/mongoose').init(() => {
  // all db dependent route require
});
// require('./config/mongoose').init();

const {
  app,
  server,
} = require('./web/server');

require('./commons/helpers/gracefullyShutDown')(server);

// Create necessary folders
require('./commons/helpers/createFolders')();

// exported for TESTING
module.exports = app;