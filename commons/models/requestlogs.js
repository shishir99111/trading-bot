const assert = require('assert')

let Schema = null

function init() {
  const logSchema = new Schema({
    type: String,
    clientId: String,
    request: {
      method: String,
      path: String,
      body: {},
    },
    response: {},
    error: {
      name: String,
      message: Schema.Types.Mixed,
      opts: {},
    },
    status: String,
  }, {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  })

  /*
  logSchema.pre('save', () => {

  })
  */
  return logSchema
}

module.exports = (schema) => {
  assert.ok(schema)
  Schema = schema
  return init()
}