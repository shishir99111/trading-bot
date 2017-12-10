const enums = require('./enums');

const BANK_STATEMENT_FILE_STATUS = {
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
};

module.exports = Object.assign({
  BANK_STATEMENT_FILE_STATUS,
}, enums);