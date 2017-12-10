const Joi = require('joi');
const Boom = require('boom');
const moment = require('moment');
const uuidv5 = require('uuid/v5');
const { enrichResponseOTPObj } = require('./authentication.getters');

const { insert } = rootRequire('db').pg;
const { getErrorMessages, enrichUserAuditObj } = rootRequire('utils');
const {
  getAuthenticatedUser,
  getRequestedOTP,
  setRedisSession,
  getSessionUser,
  comparePassword,
} = rootRequire('helpers').user;

async function logic(req) {
  try {
    const authValidationJoi = Joi.object().keys({
      email: Joi.string().required(),
      otp: Joi.number().optional(),
      password: Joi.string().optional(),
    });
    const { error } = Joi.validate(req.body, authValidationJoi);
    if (error) throw Boom.badRequest(getErrorMessages(error));

    const user = await getAuthenticatedUser({ emailId: req.body.email });
    if (user.rows.length === 0) throw Boom.badRequest('Invalid Email Address or Password');

    if (!user.rows[0].is_active) {
      throw Boom.badRequest('Your account is not active. Please contact Instarem support.');
    }

    if (user.rows[0].is_instarem_user) {
      throw Boom.badRequest('User is not authorized to access this Portal. Please contact Instarem support.');
    }

    if (!req.body.password) throw Boom.unauthorized('Please provide password');
    const isMatch = await comparePassword(req.body.password, user.rows[0].password);
    if (!isMatch) {
      throw Boom.unauthorized('Invalid Email Address or Password');
    }

    if (!req.body.otp) throw Boom.badRequest('Please provide OTP');

    const requestedOTP = await getRequestedOTP(user.rows[0].user_id, 'BOTH');
    let isOTPVerified = true;
    let OtpError = null;

    if (parseInt(req.body.otp, 10) !== requestedOTP.rows[0].request_otp) {
      isOTPVerified = false;
      OtpError = 'Incorrect OTP';
    } else if ((new Date()).getTime() > requestedOTP.rows[0].otp_expires_at.getTime()) {
      isOTPVerified = false;
      OtpError = 'OTP Expired';
    }

    const OTPObj = enrichResponseOTPObj(req, user.rows[0], requestedOTP.rows[0].otp_request_id, isOTPVerified, 'BOTH');
    await insert({ tableName: 'otp_response', data: OTPObj });
    if (!OTPObj.is_otp_verified) throw Boom.unauthorized(OtpError);

    /** User Audit logs */
    await insert({
      tableName: 'user_audit',
      data: enrichUserAuditObj(req, user.rows[0]),
    });

    /** deleting sensitive user's information */
    delete user.rows[0].password;
    /** Setting redis session for authenticated user  */
    const sessionUser = await getSessionUser(user.rows[0].user_id);
    if (sessionUser.rows.length === 0) throw Boom.badImplementation('User\'s session cannot be set');

    // ... using predefined DNS namespace (for domain names) 
    const sid = uuidv5(`${moment().format()}_${user.rows[0].user_id}`, process.env.SHA1_NAMESPACE);

    const payloads = {
      login_time: moment().format(),
      last_activity_at: moment().format(),
      data: sessionUser.rows[0],
    };
    await setRedisSession(`user:${sid}`, payloads);
    return { token: sid, user: sessionUser.rows[0] };
  } catch (e) {
    throw e;
  }
}

function handler(req, res, next) {
  logic(req).then((data) => {
    res.json(data);
  }).catch(err => next(err));
}
module.exports = handler;