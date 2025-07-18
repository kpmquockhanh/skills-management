import Joi from 'joi';

export function validateRegister(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
    password: Joi.string().min(6).max(20).required(),
    name: Joi.string().min(3).max(24).required(),
    language: Joi.string().valid('tr', 'en').required(),
    platform: Joi.string().valid('Android', 'IOS', 'Web').required(),
    timezone: Joi.number().required(),
    deviceId: Joi.string().min(4).required(),
  });
  return schema.validate(body);
}

export function validateLogin(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
    password: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(body);
}

export function validateSendVerificationCode(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
  });
  return schema.validate(body);
}

export function validateVerifyEmail(body) {
  const schema = Joi.object({
    token: Joi.string().min(10).required(),
    code: Joi.string().length(4).required(),
  });
  return schema.validate(body);
}

export function validateRefreshToken(body) {
  const schema = Joi.object({
    refreshToken: Joi.string().min(10).required(),
  });
  return schema.validate(body);
}

export function validateForgotPassword(body) {
  const schema = Joi.object({
    password: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(body);
}

export function validateChangePassword(body) {
  const schema = Joi.object({
    oldPassword: Joi.string().min(6).max(20).required(),
    newPassword: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(body);
}

export function validateEditUser(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(24),
    username: Joi.string().min(3).max(15),
    language: Joi.string().valid('tr', 'en'),
    gender: Joi.string().optional().allow('', null).valid('', 'male', 'female', 'other').default(''),
    birthDate: Joi.date(),
    date: Joi.date(),
  });
  return schema.validate(body);
}

export function validateCreateUser(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(24).required(),
    email: Joi.string().email().min(3).required(),
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(6).max(20).required(),
    type: Joi.string().valid('admin', 'user', 'teacher', 'kid').default('user'),
    language: Joi.string().valid('tr', 'en').default('en'),
    gender: Joi.string().allow('', null).valid('', 'male', 'female', 'other').default(''),
    isActivated: Joi.boolean().default(true),
    isVerified: Joi.boolean().default(true),
    isPremium: Joi.boolean().default(false),
    platform: Joi.string().valid('android', 'ios', 'web').required(),
  });
  return schema.validate(body);
}

export function validateUpdateUser(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(24),
    email: Joi.string().optional().allow('', null).email().min(3),
    username: Joi.string().min(3).max(15),
    type: Joi.string().valid('admin', 'user', 'teacher', 'kid'),
    language: Joi.string().valid('tr', 'en'),
    gender: Joi.string().optional().allow('', null).valid('', 'male', 'female', 'other'),
    isActivated: Joi.boolean(),
    isVerified: Joi.boolean(),
    isPremium: Joi.boolean(),
    password: Joi.string().optional().allow('', null).min(6).max(20),
  });
  return schema.validate(body);
}
