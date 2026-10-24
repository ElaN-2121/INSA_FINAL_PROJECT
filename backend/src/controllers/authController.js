const authService = require('../services/authService');
const auditService = require('../services/auditService');
const userRepository = require('../repositories/userRepository');
const { success, error } = require('../utils/apiResponse');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 'Email and password are required', 400);
  }

  const result = await authService.login(email, password);
  if (!result) {
    return error(res, 'Invalid email or password', 401);
  }

  await auditService.log({
    userId: result.user.id,
    action: auditService.USER_LOGIN,
    entityType: 'user',
    entityId: result.user.id,
    ipAddress: req.ip,
    details: { email: result.user.email },
  });

  return success(res, { token: result.token, user: result.user }, 'Login successful');
}

async function loginWithFayda(req, res) {
  const { fayda_id } = req.body;

  const result = await authService.loginWithFayda(fayda_id);
  if (!result) {
    return error(res, 'Student not found', 404);
  }

  return success(res, { token: result.token, user: result.user }, 'Login successful');
}

async function logout(req, res) {
  await auditService.log({
    userId: req.user.id,
    action: auditService.USER_LOGOUT,
    entityType: 'user',
    entityId: req.user.id,
    ipAddress: req.ip,
    details: null,
  });

  return success(res, null, 'Logged out successfully');
}

async function getMe(req, res) {
  const user = await userRepository.findById(req.user.id);
  if (!user) {
    return error(res, 'User not found', 404);
  }

  const { password_hash, ...userWithoutPassword } = user;
  return success(res, userWithoutPassword, 'Success');
}

async function updateProfile(req, res) {
  const { full_name, email } = req.body;
  const fields = {};

  if (full_name !== undefined) fields.full_name = full_name;
  if (email !== undefined) fields.email = email;

  if (Object.keys(fields).length === 0) {
    return error(res, 'No valid fields to update', 400);
  }

  if (email) {
    const existing = await userRepository.findByEmail(email);
    if (existing && existing.id !== req.user.id) {
      return error(res, 'This email is already registered', 409);
    }
  }

  const updated = await userRepository.updateUser(req.user.id, fields);
  if (!updated) {
    return error(res, 'Failed to update profile', 400);
  }

  const { password_hash, ...userWithoutPassword } = updated;
  return success(res, userWithoutPassword, 'Profile updated successfully');
}

async function registerStudent(req, res) {
  const { full_name, fayda_id, email } = req.body;

  if (!full_name || !fayda_id || !email) {
    return error(res, 'All fields are required', 400);
  }

  try {
    const { token, user } = await authService.registerStudent({ full_name, fayda_id, email });

    await auditService.log({
      userId: user.id,
      action: auditService.USER_LOGIN,
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
      details: { email: user.email, registration: true },
    });

    return success(res, { token, user }, 'Registration successful', 201);
  } catch (err) {
    if (
      err.message === 'This Fayda ID is already registered' ||
      err.message === 'This email is already registered'
    ) {
      return error(res, err.message, 409);
    }
    throw err;
  }
}

async function registerEmployer(req, res) {
  const { full_name, email, password, company_name } = req.body;

  if (!full_name || !email || !password || !company_name) {
    return error(res, 'All fields are required', 400);
  }

  try {
    const { token, user } = await authService.registerEmployer({
      full_name,
      email,
      password,
      company_name,
    });

    return success(res, { token, user }, 'Registration successful', 201);
  } catch (err) {
    if (
      err.message === 'This email is already registered' ||
      err.message === 'Password must be at least 8 characters'
    ) {
      return error(res, err.message, 409);
    }
    throw err;
  }
}

module.exports = {
  login,
  loginWithFayda,
  logout,
  getMe,
  updateProfile,
  registerStudent,
  registerEmployer,
};
