const MODEL = require('../models').requestlogs
const DAO = require('./DAO') // return constructor function.


function LogsDAO() {
  this.Model = MODEL
}

// Prototypal Inheritance
LogsDAO.prototype = new DAO()

module.exports = () => new LogsDAO()