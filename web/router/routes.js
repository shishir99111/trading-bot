const router = require('express').Router();

// routes loaded
router.get('/', (req, res) => {
  res.json({
    success: true,
    version: 'v1.0.0',
    platforms: ['Zerodha'],
    market: ['Indian Stock Market'],
  });
});

require('./authentication')(router)

/**
 * Appends different routes to the
 * router and exports it.
 * @returns {object} express router instance
 */
module.exports = () => router;