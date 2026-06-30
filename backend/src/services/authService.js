const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');
const { signToken } = require('../config/jwt');

function formatUserResponse(user) {
  const response = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    institution_id: user.institution_id,
  };
  if (user.company_name) {
    response.company_name = user.company_name;
  }
  return response;
}

async function login(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return null;
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    return null;
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    institution_id: user.institution_id,
  });

  return { token, user: formatUserResponse(user) };
}

async function loginWithFayda(fayda_id) {
  const user = await userRepository.findByFaydaId(fayda_id);
  if (!user) {
    return null;
  }

  if (user.role !== 'STUDENT') {
    return null;
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    institution_id: user.institution_id,
  });

  return { token, user: formatUserResponse(user) };
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function validatePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function registerStudent({ full_name, fayda_id, email }) {
  const existingFayda = await userRepository.findByFaydaId(fayda_id);
  if (existingFayda) {
    throw new Error('This Fayda ID is already registered');
  }

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    throw new Error('This email is already registered');
  }

  const randomPassword = crypto.randomBytes(16).toString('hex');
  const password_hash = await hashPassword(randomPassword);

  const user = await userRepository.createUser({
    email,
    password_hash,
    role: 'STUDENT',
    full_name,
    fayda_id,
    institution_id: null,
    company_name: null,
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    institution_id: user.institution_id,
  });

  return { token, user: formatUserResponse(user) };
}

async function registerEmployer({ full_name, email, password, company_name }) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    throw new Error('This email is already registered');
  }

  const password_hash = await hashPassword(password);

  const user = await userRepository.createUser({
    email,
    password_hash,
    role: 'EMPLOYER',
    full_name,
    fayda_id: null,
    institution_id: null,
    company_name,
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    institution_id: user.institution_id,
  });

  return { token, user: formatUserResponse(user) };
}

async function createAdmin({ full_name, email, password }, creatingAdminId) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    throw new Error('This email is already registered');
  }

  const password_hash = await hashPassword(password);

  const user = await userRepository.createUser({
    email,
    password_hash,
    role: 'ADMIN',
    full_name,
    fayda_id: null,
    institution_id: null,
    company_name: null,
  });

  await auditService.log({
    userId: creatingAdminId,
    action: auditService.ADMIN_CREATED,
    entityType: 'user',
    entityId: user.id,
    ipAddress: null,
    details: { created_by: creatingAdminId },
  });

  return formatUserResponse(user);
}

module.exports = {
  login,
  loginWithFayda,
  hashPassword,
  validatePassword,
  registerStudent,
  registerEmployer,
  createAdmin,
  formatUserResponse,
};
