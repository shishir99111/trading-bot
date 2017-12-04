const requestlogsDAO = require('./requestlogs.DAO')();
const identityCounterDAO = require('./identityCounter.DAO')();

module.exports = {
  requestlogsDAO,
  identityCounterDAO,
};