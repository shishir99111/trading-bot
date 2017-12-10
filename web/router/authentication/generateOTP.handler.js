const Joi = require('joi');
const Boom = require('boom');

const { insert } = rootRequire('db').pg;
const {
  getErrorMessages,
  randomNumber,
  enrichOTPObj,
  enrichOTPEmail,
  enrichMobileOTPObj,
} = rootRequire('utils');
const { getAuthenticatedUser, comparePassword } = rootRequire('helpers').user;

async function logic(req) {
  let user;
  let OTP;
  try {
    const authValidationJoi = Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().optional(),
    });
    const { error } = Joi.validate(req.body, authValidationJoi);
    if (error) throw Boom.badRequest(getErrorMessages(error));

    user = await getAuthenticatedUser({ emailId: req.body.email });
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
    OTP = 123456;

    // if we have a sms service
    /* if (process.env.NODE_ENV === 'production') {
      const { sendNotificationToEmail, sendNotificationToPhone } = rootRequire('services').sendNotification;
      OTP = randomNumber(6);

      const emailResponse = await sendNotificationToEmail(enrichOTPEmail(req.body.email, OTP));
      if (emailResponse.data.error || emailResponse.data.errors || emailResponse.status !== 200) {
        throw Boom.badImplementation('Notification service error');
      }
      if (user.mobile_number) {
        const mobileResponse = await sendNotificationToPhone(enrichMobileOTPObj(req, user, OTP));
        if (mobileResponse.data.error || mobileResponse.data.errors || mobileResponse.status !== 200) {
          throw Boom.badImplementation('Notification service error');
        }
      }
      logger.info(`OTP - ${OTP} sent successfully to ${user.rows[0].email}`);
    } // end of if(production)
    */

    return 1;
  } catch (e) {
    throw e;
  } finally {
    logger.info('Logging the user login details');
    /** User Audit Logs */
    if (user.rowCount !== 0) {
      /** Logging and mailing the OTP information */
      await insert({
        tableName: 'otp_request',
        data: enrichOTPObj(req, user.rows[0], OTP, 'BOTH'),
      });
    }
  }
}

function handler(req, res, next) {
  logic(req).then((data) => {
    res.json(data);
  }).catch(err => next(err));
}
module.exports = handler;