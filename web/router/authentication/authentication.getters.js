const { getGEOIP, getUserAgent } = rootRequire('utils');

function enrichResponseOTPObj(req, user, otpRequestId, isOTPVerified, type) {
  return {
    otp_request_id: parseInt(otpRequestId, 10),
    user_id: user.user_id,
    remitter_id: user.remitter_id,
    type,
    response_otp: req.body.otp,
    is_otp_verified: isOTPVerified,
    ip_info: JSON.stringify(getGEOIP(req)),
    user_agent_info: JSON.stringify(getUserAgent(req)),
    created_by: user.user_id,
    updated_by: user.user_id,
  };
}

module.exports = { enrichResponseOTPObj }