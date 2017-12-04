// const assert = require('assert')

const MODEL = require('../models').identityCounter;
const DAO = require('./DAO'); // return constructor function.

function IdentityCounterDAO() {
  this.Model = MODEL;
}

// Prototypal Inheritance
IdentityCounterDAO.prototype = new DAO()

module.exports = () => new IdentityCounterDAO()