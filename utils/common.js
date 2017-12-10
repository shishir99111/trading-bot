const moment = require('moment');
const axios = require('axios');
const papa = require('papaparse');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const uuid = require('uuid');
const crypto = require('crypto');
const fs = require('fs');

useragent(true);

/* ========================== Basic Utilities ============================ */

function randomNumber(digits) {
  const _digits = digits || 5;
  const multiplier = Math.pow(10, (_digits - 1)); // eslint-disable-line
  return Math.floor(multiplier + (Math.random() * (9 * multiplier)));
}

function isNumeric(num) {
  return !isNaN(num);
}

function toFixedDecimal(num, scale) {
  const _scale = scale || 2;
  return parseFloat(parseFloat(num).toFixed(_scale));
}

/**
 * Convert string to title string
 * @param {*} str 
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

function isValidEmailAddress(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function trimObject(obj) {
  let value;
  Object.keys(obj).forEach((key) => {
    value = obj[key];
    if (value && typeof value === 'string') {
      obj[key] = value.trim();
    } else if (value && value.constructor === Object && typeof value === 'object') {
      obj[key] = trimObject(value);
    }
  });
  return obj;
}

function getErrorMessages(error) {
  if (error.details && error.details.length > 0) {
    return error.details.reduce((p, v) => {
      return `${p}${v.message} </br>`;
    }, '');
  }
  return error.message;
}

/**
 * Get Client IP Address from request details
 * @param {*} req
 */
function getClientIpAddress(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (clientIp.indexOf(':') !== -1) {
    // check for non x-forwarded-for headers request
    clientIp = clientIp.split(':').pop();
    // check for localhost
    if (clientIp === '1') {
      clientIp = '127.0.0.1';
    }
  }
  return clientIp;
}

/**
 * GET IP Informations
 * @param {*} req 
 */

function getGEOIP(req) {
  const ip = req.clientIP;
  const geo = ip && ip !== '127.0.0.1' ? geoip.lookup(ip) : ip;
  return geo || ip;
}

function getUserAgent(req) {
  return useragent.lookup(req.userAgent) || req.userAgent;
}

function sanitizeObj(obj) {
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (typeof val !== 'boolean') {
      if (val) {
        obj[key] = val || '';
      } else {
        delete obj[key];
      }
    }
  });
  return obj;
}

/* =========================== Date Utilities ============================ */

// extracts date from datetime object
function toDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Convert String to Date
function parseDate(str, opts = {}) {
  const _format = opts.format || 'DD/MM/YYYY';
  const _setTime = opts.setTime || false;
  const momentDate = moment(str, _format);
  if (_setTime) {
    momentDate.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  }
  return momentDate.isValid() ? momentDate.toDate() : null;
}

// Convert Date to String
function formatDate(date, format) {
  const _format = format || 'DD/MM/YYYY';
  return moment(date).format(_format);
}

// Subtracts one month from Today's Date
function defaultStartDate() {
  return parseDate(formatDate(moment().subtract(1, 'month')));
}

// Today's Date
function defaultEndDate(opts = {}) {
  return parseDate(formatDate(moment()), { setTime: opts.setTime || false });
}

// First Date of current month
function startOfMonth() {
  return moment().startOf('month').toDate();
}

// Last Date of current month
function endOfMonth() {
  return moment().endOf('month').toDate();
}

// Get start of the day
function startOfDay(date) {
  if (date) {
    return moment(date).startOf('day');
  }
  return moment().startOf('day');
}

// Add Days to a date
function addDays(date, days) {
  return moment(date).add(days, 'days').toDate();
}


/* ============================ CSV To JSON ============================ */

function downloadCSV(url) {
  return axios.get(url)
    .then((res) => {
      return res.data;
    });
}

function csvToJSON(csv) {
  return new Promise((resolve, reject) => {
    papa.parse(csv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      error: function(err, file, inputElem, reason) {
        // executed if an error occurs while loading the file,
        // or if before callback aborted for some reason
        reject(err);
      },
      complete: function(results) {
        // console.log("Done Parsing")
        resolve(results.data);
      },
    });
  });
}

function getAppName() {
  return require('../package.json').name;
}

function generateCorellationId() {
  return `INSTA-${uuid.v1()}`;
}

function checksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex');
}

function generateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(checksum(data));
    });
  }).catch(err => {
    throw err;
  });
}

function getJoiErrors(error) {
  if (error && error.isJoi) {
    const errors = error.details.map((error) => {
      return error.message;
    });
    return errors.join(',');
  }
  return '';
}

function toUTCDate(date) {
  return moment.utc(date).format('DD-MM-YYYYTHH:mm:ss');
}


module.exports = function(obj) {
  obj.isNumeric = isNumeric;
  obj.isValidEmailAddress = isValidEmailAddress;
  obj.randomNumber = randomNumber;
  obj.parseDate = parseDate;
  obj.formatDate = formatDate;
  obj.startOfMonth = startOfMonth;
  obj.endOfMonth = endOfMonth;
  obj.defaultStartDate = defaultStartDate;
  obj.defaultEndDate = defaultEndDate;
  obj.toDate = toDate;
  obj.downloadCSV = downloadCSV;
  obj.csvToJSON = csvToJSON;
  obj.addDays = addDays;
  obj.trimObject = trimObject;
  obj.startOfDay = startOfDay;
  obj.toTitleCase = toTitleCase;
  obj.getClientIpAddress = getClientIpAddress;
  obj.getGEOIP = getGEOIP;
  obj.getUserAgent = getUserAgent;
  obj.getErrorMessages = getErrorMessages;
  obj.toFixedDecimal = toFixedDecimal;
  obj.sanitizeObj = sanitizeObj;
  obj.getAppName = getAppName;
  obj.generateCorellationId = generateCorellationId;
  obj.toUTCDate = toUTCDate;
  obj.generateFileHash = generateFileHash;
  obj.getJoiErrors = getJoiErrors;
};