/*
 * This file contains all the neccesary scripts which has to be
 * executed as the application starts.
 */
const fs = require('fs');

function createKeysFolder() {
  const dir = './keys';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    return logger.info('keys folder Created');
  }
  return true;
}

module.exports = () => {
  createKeysFolder();
};