const moment = require('moment');
const fs = require('fs');
const q = require('q');

function ddmmyyyy(d) {
  const format = 'DDMMYYYY';
  return moment(d).format(format);
}

function fixLength(content, fixLen) {
  const len = content.length;
  let c = content;
  const maxLenString = Array(100).join('X');
  if (len > fixLen) {
    c = content.substring(0, fixLen);
  } else if (len < fixLen) {
    c = c.concat(maxLenString);
    c = c.substring(0, fixLen);
  }
  return c;
}

function pad(num, size) {
  const zeroes = Array(11).join('0');
  const s = `${zeroes}${num}`;
  return s.substr(s.length - size);
}

module.exports = (obj) => {
  obj.ddmmyyyy = ddmmyyyy;
  obj.fixLength = fixLength;
  obj.pad = pad;
};