const authenticationHandler = require('./authenticate.handler');
const generateOTPHandler = require('./generateOTP.handler');
const appAuthenticationHandler = require('./appAuthentication.handler');


/**
 * Mounts component specific routes,
 * along with there respective route handlers
 * @param {object} router
 */
module.exports = (router) => {
  router.post('/authentication/generateOTP', generateOTPHandler);
  router.post('/authentication', appAuthenticationHandler);
  router.post('/auth', authenticationHandler);
};