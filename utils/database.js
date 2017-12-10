const moment = require('moment');

// logger.info(LOGIN_LINK);

function getCommaSeparatedColumns(obj) {
  return Object.keys(obj).join(',');
}

function getObjectValues(obj) {
  return Object.keys(obj).map((key) => obj[key]);
}

function getCommaSeparatedParamSubtitute(obj, counter) {
  let _counter = counter || 1;
  const params = [];
  Object.keys(obj).forEach(() => {
    params.push(`$${_counter}`);
    _counter += 1;
  }, this);
  return params.join(',');
}

function getUpdateSetClause(obj, counter) {
  let _counter = counter || 1;
  const result = Object.keys(obj).map((key) => {
    const pair = `${key}=$${_counter}`;
    _counter += 1;
    return pair;
  });
  return result.join(',');
}

/* =========================== Enrichment Utilities ============================ */

function enrichOTPObj(req, user, otp, type) {
  return {
    user_id: user.user_id,
    type,
    request_otp: otp,
    otp_expires_at: moment(new Date()).add(15, 'm')._d,
    ip_info: JSON.stringify(this.getGEOIP(req)),
    user_agent_info: JSON.stringify(this.getUserAgent(req)),
    created_by: user.user_id,
    updated_by: user.user_id,
  };
}

function enrichOTPEmail(email, otp) {
  return {
    type: 'EMAIL_OTP_GENERATION',
    email_message: {
      targets: {
        to: [email],
      },
      params: {
        otp: otp,
      },
      template: 'otp_generate',
      service: 'sendgrid',
    },
  };
}


function enrichMobileOTPObj(req, user, otp) {
  return {
    user_id: parseInt(user.user_id, 10),
    remitter_id: parseInt(user.remitter_id, 10),
    type: 'PHONE',
    request_otp: otp,
    otp_expires_at: moment(new Date()).add(15, 'm')._d,
    ip_info: JSON.stringify(this.getGEOIP(req)),
    user_agent_info: JSON.stringify(this.getUserAgent(req)),
    created_by: parseInt(user.user_id, 10),
    updated_by: parseInt(user.user_id, 10),
  };
}

function enrichUserAuditObj(req, user) {
  return {
    user_id: user.user_id,
    ip_info: JSON.stringify(this.getGEOIP(req)),
    user_agent_info: JSON.stringify(this.getUserAgent(req)),
    created_by: user.created_by,
    updated_by: user.updated_by,
  };
}

function getInstaremObjectId(type, code) {
  const { query } = rootRequire('db').pg;
  const text = 'SELECT instarem_object_id FROM instarem_object io WHERE type = $1 AND code = $2';
  return query(text, [type, code]);
}

function getInstaremObjectCode(id) {
  const { query } = rootRequire('db').pg;
  const text = 'SELECT code FROM instarem_object WHERE instarem_object_id = $1';
  return query(text, [id]);
}

module.exports = (obj) => {
  obj.getCommaSeparatedColumns = getCommaSeparatedColumns;
  obj.getObjectValues = getObjectValues;
  obj.getCommaSeparatedParamSubtitute = getCommaSeparatedParamSubtitute;
  obj.getUpdateSetClause = getUpdateSetClause;
  obj.enrichUserAuditObj = enrichUserAuditObj.bind(obj);
  obj.enrichMobileOTPObj = enrichMobileOTPObj.bind(obj);
  obj.enrichOTPEmail = enrichOTPEmail;
  obj.enrichOTPObj = enrichOTPObj.bind(obj);
  obj.getInstaremObjectId = getInstaremObjectId;
  obj.getInstaremObjectCode = getInstaremObjectCode;
};