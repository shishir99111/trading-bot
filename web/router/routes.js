const router = require('express').Router();
const authenticationHandler = require('./authenticate.handler');

// routes loaded
router.get('/', (req, res) => {
  res.json({
    success: true,
    version: 'v1.0.0',
    platforms: ['Zerodha'],
    market: ['Indian Stock Market'],
  });
});

router.post('/auth', authenticationHandler);

/**
 * Appends different routes to the
 * router and exports it.
 * @returns {object} express router instance
 */
module.exports = () => router;