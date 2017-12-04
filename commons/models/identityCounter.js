const assert = require('assert');


let Schema = null;

function init() {
  const identityCounterSchema = new Schema({
    model: { type: String },
    field: { type: String },
    count: { type: Number },
  });
  return identityCounterSchema;
}

module.exports = (schema) => {
  assert.ok(schema);
  Schema = schema;
  return init();
};