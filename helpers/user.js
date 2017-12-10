const { sanitizeObj } = rootRequire('utils');
const { query } = rootRequire('db').pg;
const { client } = rootRequire('db').redis;
const Boom = require('boom');
const bcrypt = require('bcrypt');

const redisSessionExpiry = process.env.REDIS_SESSION_EXPIRY_TIME;

function getSystemUser() {
  const text = 'SELECT * FROM user_account u WHERE email = $1';
  return query(text, ['b2c_system@instarem.com']);
}

function exists(queryObj) {
  const keys = Object.keys(queryObj);
  const text = ['SELECT count(1) FROM user_account WHERE 1 = 1 '];

  keys.reduce((a, k, i) => {
    return text.push(`${k} = $${i+1}`);
  }, text);

  // will change it to Object.values once nodejs 8 gets stable!..
  const values = Object.keys(queryObj).map(k => queryObj[k]);
  return query(text.join(' AND '), values);
}

function referralExists(referralCode) {
  const text = 'SELECT count(1) FROM user_account WHERE referral_code = $1';
  return query(text, [referralCode]);
}

function getUserByEmail(email) {
  const text = 'SELECT * FROM user_account WHERE email = $1 LIMIT 1';
  return query(text, [email]);
}

function getRequestedOTP(userID, type) {
  let text = 'SELECT * FROM otp_request';
  text = `${text} WHERE 1 =1 AND user_id = $1 AND type=$2`;
  text = `${text} ORDER BY created_at DESC LIMIT 1 `;
  return query(text, [userID, type]);
}

function getAuthenticatedUser({ emailId, authId, authType }) {
  let text = 'SELECT u.user_id, u.email, u.client_id, u.full_name, u.is_active, ';
  text = `${text} u.is_email_confirmed, u.password, u.created_by, u.updated_by`;
  text = `${text} FROM user_account u WHERE 1=1 AND u.is_active = $1`;
  const values = [true];
  if (emailId) {
    values.push(emailId);
    text = `${text} AND u.email=$${values.length}`;
  }
  if (authId && authType) {
    values.push(authId);
    text = `${text} AND u.auth_id = $${values.length}`;
    values.push(authType);
    text = `${text} AND u.auth_type = $${values.length}`;
  }
  return query(text, values);
}

async function getSessionUser(userId) {
  if (!userId) throw Boom.badRequest('User Id is required for setting up the session.');
  let userQuery = 'SELECT u.user_id, u.email, u.is_email_confirmed, u.created_by, u.updated_by';
  userQuery = `${userQuery} FROM user_account u WHERE 1=1 AND u.is_active = $1 AND u.user_id = $2`;
  const values = [true, userId];
  const user = await query(userQuery, values);
  const clientId = user.rows[0].client_id;

  // getting data related to the access of client(region)
  let clientAccessQuery = 'SELECT c.client_id, c.code, c.name, c.description, c.country_code';
  clientAccessQuery = `${clientAccessQuery} FROM user_client uc INNER JOIN client c ON uc.client_id = c.client_id`;
  clientAccessQuery = `${clientAccessQuery} WHERE 1=1 AND uc.is_active = $1 AND uc.user_id = $2`;
  const values2 = [true, userId];
  const clientAccess = await query(clientAccessQuery, values2);
  if (clientAccess.rows instanceof Array) {
    user.rows[0].clientAccess = clientAccess.rows;
  } else {
    user.rows[0].clientAccess = [clientAccess.rows];
  }

  // getting data of roles assigned and its info.
  let roleQuery = 'SELECT r.role_id, r.name , r.code, rt.name as role_type';
  roleQuery = `${roleQuery} FROM user_role ur INNER JOIN role r ON r.role_id = ur.role_id`;
  roleQuery = `${roleQuery} INNER JOIN role_type rt ON rt.role_type_id = r.role_type_id`;
  roleQuery = `${roleQuery} INNER JOIN user_account u ON u.user_id = ur.user_id`;
  roleQuery = `${roleQuery} WHERE 1=1 AND u.is_active = $1 AND r.is_active = $1`;
  roleQuery = `${roleQuery} AND ur.user_id = $2`;
  const values3 = [true, userId];
  const role = await query(roleQuery, values3);
  if (role.rows instanceof Array) {
    user.rows[0].roles = role.rows;
  } else {
    user.rows[0].roles = [role.rows];
  }

  // getting data related to the access of menus with associated permission
  let userMenuAccessQuery = 'SELECT m.menu_id, m.code, m.name, m.description, m.url, m.language,';
  userMenuAccessQuery = `${userMenuAccessQuery} m.branch, m.sub_branch_1, m.sub_branch_2, uma.permission`;
  userMenuAccessQuery = `${userMenuAccessQuery} FROM user_menu_access uma INNER JOIN menu m ON m.menu_id = uma.menu_id`;
  userMenuAccessQuery = `${userMenuAccessQuery} WHERE 1=1 AND uma.is_active = $1 AND uma.user_id = $2`;
  userMenuAccessQuery = `${userMenuAccessQuery} AND m.is_active = $1`;
  const values4 = [true, userId];
  const userMenuAccess = await query(userMenuAccessQuery, values4);
  if (userMenuAccess.rows instanceof Array) {
    user.rows[0].menus = userMenuAccess.rows;
  } else {
    user.rows[0].menus = [userMenuAccess.rows];
  }

  return user;
}

/** ============================ Redis Utilities ============================= */

function setRedisSession(key, value) {
  return new Promise((resolve, reject) => {
    let _value = sanitizeObj(value);
    _value = JSON.stringify(_value);
    client.set(key, _value, 'EX', redisSessionExpiry, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

function getRedisSession(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (err, response) => {
      if (err) return reject(err);
      // extending the session data expiry on every get event.
      client.expire(key, redisSessionExpiry);
      resolve(JSON.parse(response));
    });
  });
}

function deleteRedisSession(key) {
  return new Promise((resolve, reject) => {
    client.del(key, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

function comparePassword(candidatePassword, savedPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, savedPassword, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
}

async function getCodeFromId(table, id) {
  const queryText = `SELECT code FROM ${table} WHERE ${table}_id = $1`;
  return query(queryText, [id]);
}

module.exports = {
  getSystemUser,
  getUserByEmail,
  getRequestedOTP,
  getAuthenticatedUser,
  exists,
  setRedisSession,
  getRedisSession,
  deleteRedisSession,
  getSessionUser,
  referralExists,
  comparePassword,
  getCodeFromId,
};