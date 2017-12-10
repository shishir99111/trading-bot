// Exporting
const obj = {};

// mounting utility functions
require('./common')(obj);

// mounting database functions
require('./database')(obj);

module.exports = obj;