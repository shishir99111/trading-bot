const mongoose = require('mongoose')

// Setting default SYSTEM PROMISE
mongoose.Promise = global.Promise;

const { Schema } = mongoose;

// loading all the models
const identityCounter = mongoose.model('identityCounter', require('./identityCounter')(Schema));
const requestlogs = mongoose.model('requestlogs', require('./requestlogs')(Schema));

// registring models
const model = {
  identityCounter,
  requestlogs,
};

module.exports = model;